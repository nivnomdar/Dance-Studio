import { Session } from '../types/sessions';
import { BOOKING_DAYS_AHEAD } from '../config/booking';
import { API_BASE_URL, CACHE_DURATION, DAY_NAMES_EN, DAY_NAMES_HE, TIMEOUTS, createTimeoutPromise } from './constants';
import { apiService } from '../lib/api';
import { isSessionActiveOnDay } from './weekdaysUtils';
import { 
  setDataWithTimestamp, 
  getDataWithTimestamp, 
} from './cookieManager';

// Enhanced cache with class-specific caching
interface CacheEntry {
  data: any;
  timestamp: number;
}

// Cache for sessions data to prevent excessive API calls
let sessionsCache: CacheEntry | null = null;
let sessionClassesCache: CacheEntry | null = null;
let classSessionsCache: Map<string, CacheEntry> = new Map();
let classDatesCache: Map<string, CacheEntry> = new Map();
let classTimesCache: Map<string, CacheEntry> = new Map();

// Cookie cache keys
const STORAGE_KEYS = {
  SESSIONS: 'dance_studio_sessions_cache',
  SESSION_CLASSES: 'dance_studio_session_classes_cache',
  CLASS_SESSIONS: 'dance_studio_class_sessions_cache',
  CLASS_DATES: 'dance_studio_class_dates_cache',
  CLASS_TIMES: 'dance_studio_class_times_cache'
};

/**
 * פונקציה לבדיקת תוקף cache
 */
const isCacheValid = (cache: CacheEntry | null): boolean => {
  if (!cache) return false;
  return (Date.now() - cache.timestamp) < CACHE_DURATION;
};

// Load cache from localStorage on initialization
const loadCacheFromStorage = () => {
  try {
    const sessionsData = getDataWithTimestamp<CacheEntry>(STORAGE_KEYS.SESSIONS, CACHE_DURATION);
    if (sessionsData) {
      sessionsCache = sessionsData;
    }
    
    const sessionClassesData = getDataWithTimestamp<CacheEntry>(STORAGE_KEYS.SESSION_CLASSES, CACHE_DURATION);
    if (sessionClassesData) {
      sessionClassesCache = sessionClassesData;
    }
    
    const classSessionsData = getDataWithTimestamp<Record<string, CacheEntry>>(STORAGE_KEYS.CLASS_SESSIONS, CACHE_DURATION);
    if (classSessionsData) {
      for (const [key, value] of Object.entries(classSessionsData)) {
        if (isCacheValid(value)) {
          classSessionsCache.set(key, value);
        }
      }
    }
    
    const classDatesData = getDataWithTimestamp<Record<string, CacheEntry>>(STORAGE_KEYS.CLASS_DATES, CACHE_DURATION);
    if (classDatesData) {
      for (const [key, value] of Object.entries(classDatesData)) {
        if (isCacheValid(value)) {
          classDatesCache.set(key, value);
        }
      }
    }
    
    const classTimesData = getDataWithTimestamp<Record<string, CacheEntry>>(STORAGE_KEYS.CLASS_TIMES, CACHE_DURATION);
    if (classTimesData) {
      for (const [key, value] of Object.entries(classTimesData)) {
        if (isCacheValid(value)) {
          classTimesCache.set(key, value);
        }
      }
    }
  } catch (error) {
    console.warn('Failed to load cache from localStorage:', error);
  }
};

// Save cache to cookies
const saveCacheToStorage = (key: string, data: any) => {
  try {
    setDataWithTimestamp(key, data, CACHE_DURATION);
  } catch (error) {
    console.warn('Failed to save cache to cookies:', error);
  }
};

// Initialize cache from cookies
loadCacheFromStorage();

// Request throttling
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests - reduced from 8 seconds
let isRequestInProgress = false;
let requestQueue: Array<() => void> = [];
let consecutiveErrors = 0;
const MAX_CONSECUTIVE_ERRORS = 3;

/**
 * פונקציה משותפת ליצירת הודעות זמינות
 */
const generateAvailabilityMessage = (availableSpots: number): string => {
  if (availableSpots <= 0) {
    return 'מלא';
  } else if (availableSpots === 1) {
    return 'מקום אחרון זמין';
  } else if (availableSpots <= 3) {
    return `${availableSpots} זמינים`;
  } else {
    return 'זמין';
  }
};



/**
 * פונקציה לניקוי פורמט השעות - מסירה שניות ומשאירה רק שעות ודקות
 */
const formatTimeForDisplay = (session: any): string => {
  // אם יש session עם start_time ו-end_time, נחזיר start_time עד end_time
  if (session && session.start_time && session.end_time) {
    const startTime = session.start_time.includes(':') ? 
      session.start_time.split(':').slice(0, 2).join(':') : 
      session.start_time;
    
    const endTime = session.end_time.includes(':') ? 
      session.end_time.split(':').slice(0, 2).join(':') : 
      session.end_time;
    
    return `${startTime} עד ${endTime}`;
  }
  
  // Fallback - אם יש רק start_time
  if (session && session.start_time) {
    const time = session.start_time;
    if (time && time.includes(':')) {
      const parts = time.split(':');
      if (parts.length >= 2) {
        return `${parts[0]}:${parts[1]}`;
      }
    }
    return time;
  }
  
  return '';
};

/**
 * פונקציה לניקוי cache ישן
 */
const cleanupExpiredCache = () => {
  const now = Date.now();
  
  // Clean up class-specific caches
  for (const [key, cache] of classSessionsCache.entries()) {
    if (now - cache.timestamp > CACHE_DURATION) {
      classSessionsCache.delete(key);
    }
  }
  
  for (const [key, cache] of classDatesCache.entries()) {
    if (now - cache.timestamp > CACHE_DURATION) {
      classDatesCache.delete(key);
    }
  }
  
  for (const [key, cache] of classTimesCache.entries()) {
    if (now - cache.timestamp > CACHE_DURATION) {
      classTimesCache.delete(key);
    }
  }
};

/**
 * פונקציה לניהול בקשות API עם throttling משופר
 */
const throttledFetch = async (url: string, options?: RequestInit): Promise<Response> => {
  return new Promise((resolve, reject) => {
    const executeRequest = async () => {
      try {
        const now = Date.now();
        const timeSinceLastRequest = now - lastRequestTime;
        
        // Increase delay if we've had consecutive errors
        const dynamicDelay = consecutiveErrors > 0 ? MIN_REQUEST_INTERVAL * (consecutiveErrors + 1) : MIN_REQUEST_INTERVAL;
        
        if (timeSinceLastRequest < dynamicDelay) {
          // Wait before making the request
          await new Promise(resolve => setTimeout(resolve, dynamicDelay - timeSinceLastRequest));
        }
        
        lastRequestTime = Date.now();
        const response = await fetch(url, options);
        
        // Reset consecutive errors on success
        if (response.ok) {
          consecutiveErrors = 0;
        } else if (response.status === 429) {
          consecutiveErrors++;
          console.warn(`Rate limited (429). Consecutive errors: ${consecutiveErrors}`);
          
          // If too many consecutive errors, wait longer
          if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
            await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
            consecutiveErrors = 0; // Reset after long wait
          }
        }
        
        resolve(response);
      } catch (error) {
        consecutiveErrors++;
        console.error('Request error:', error);
        reject(error);
      } finally {
        isRequestInProgress = false;
        
        // Process next request in queue
        if (requestQueue.length > 0) {
          const nextRequest = requestQueue.shift();
          if (nextRequest) {
            nextRequest();
          }
        }
      }
    };
    
    if (isRequestInProgress) {
      // Queue the request
      requestQueue.push(executeRequest);
    } else {
      isRequestInProgress = true;
      executeRequest();
    }
  });
};

/**
 * קבלת sessions זמינים לפי class ID עם cache משופר ו-throttling
 */
export const getAvailableSessionsForClass = async (classId: string): Promise<Session[]> => {
  try {
    // Clean up expired cache first
    cleanupExpiredCache();
    
    // Check class-specific cache first
    const classCache = classSessionsCache.get(classId);
    if (isCacheValid(classCache || null)) {
      return classCache!.data;
    }
    
    const todayString = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
    const futureDate = new Date();
    futureDate.setDate(new Date().getDate() + BOOKING_DAYS_AHEAD - 1); // Furthest date in the booking window
    const futureDateString = futureDate.toISOString().split('T')[0];

    // Check global cache - if we have valid global cache, use it for all classes
    if (isCacheValid(sessionsCache) && isCacheValid(sessionClassesCache)) {
      const allSessions = sessionsCache!.data;
      const allSessionClasses = sessionClassesCache!.data;
      
      // Filter session classes for this specific class
      const sessionClasses = allSessionClasses.filter((sc: any) => 
        sc.class_id === classId && sc.is_active === true
      );
      
      if (sessionClasses.length === 0) {
        // Cache empty result
        classSessionsCache.set(classId, { data: [], timestamp: Date.now() });
        return [];
      }
      
      // Get session IDs for this class
      const sessionIds = sessionClasses.map((sc: any) => sc.session_id);
      
      // Filter sessions for this class, also considering start_date and end_date
      const sessions = allSessions.filter((session: any) => {
        const isLinkedToClass = sessionIds.includes(session.id);
        const isActive = session.is_active === true;

        // Check session date range (using string comparison for YYYY-MM-DD)
        const sessionStartDate = session.start_date;
        const sessionEndDate = session.end_date;

        let isDateRangeRelevant = true;
        if (sessionStartDate && sessionStartDate > futureDateString) {
          isDateRangeRelevant = false; // Session starts after the latest day we're looking for
        }
        if (sessionEndDate && sessionEndDate < todayString) {
          isDateRangeRelevant = false; // Session ended before today
        }
        return isLinkedToClass && isActive && isDateRangeRelevant;
      });
      
      // Cache the result
      classSessionsCache.set(classId, { data: sessions, timestamp: Date.now() });
      
      return sessions || [];
    }
    
    // Fetch fresh data from API with throttling
    const [sessionsResponse, sessionClassesResponse] = await Promise.all([
      throttledFetch(`${API_BASE_URL}/sessions`),
      throttledFetch(`${API_BASE_URL}/sessions/session-classes`)
    ]);
    
    if (!sessionsResponse.ok || !sessionClassesResponse.ok) {
      console.error('Failed to fetch sessions data from API');
      return [];
    }
    
    const allSessions = await sessionsResponse.json();
    const allSessionClasses = await sessionClassesResponse.json();
    
    // Update global cache
    const now = Date.now();
    sessionsCache = { data: allSessions, timestamp: now };
    sessionClassesCache = { data: allSessionClasses, timestamp: now };
    
    // Filter session classes for this specific class
    const sessionClasses = allSessionClasses.filter((sc: any) => 
      sc.class_id === classId && sc.is_active === true
    );
    
    if (sessionClasses.length === 0) {
      // Cache empty result
      classSessionsCache.set(classId, { data: [], timestamp: now });
      return [];
    }
    
    // Get session IDs for this class
    const sessionIds = sessionClasses.map((sc: any) => sc.session_id);
    
    // Filter sessions by IDs, start_date, and end_date
    const filteredSessions = allSessions.filter((session: Session) => {
      const sessionStartDate = session.start_date;
      const sessionEndDate = session.end_date;

      if (sessionIds.includes(session.id) &&
          session.is_active === true &&
          (sessionStartDate === null || sessionStartDate <= futureDateString) &&
          (!sessionEndDate || sessionEndDate >= todayString)) {
        return true;
      }
      return false;
    });

    // Cache the result for this specific class
    classSessionsCache.set(classId, { data: filteredSessions, timestamp: now });
    
    return filteredSessions || [];
  } catch (error) {
    console.error('Error in getAvailableSessionsForClass:', error);
    return [];
  }
};

/**
 * קבלת תאריכים זמינים לפי class ID - גרסה חדשה
 */
export const getAvailableDatesForButtonsFromSessions = async (classId: string): Promise<string[]> => {
  try {
    // Check cache first
    const cacheKey = `class_${classId}_dates`;
    const cached = classDatesCache.get(cacheKey);
    if (isCacheValid(cached || null)) {
      return cached!.data;
    }
    
    const sessions = await getAvailableSessionsForClass(classId);
    
    if (sessions.length === 0) {
      classDatesCache.set(cacheKey, { data: [], timestamp: Date.now() });
      return [];
    }

    // עבור recurring sessions, ניצור תאריכים לפי ה-weekdays
    const datesSet = new Set<string>(); // Use Set to prevent duplicates
    const today = new Date();
    
    // ניצור תאריכים לטווח ימים מוגדר מראש
    for (let i = 0; i < BOOKING_DAYS_AHEAD; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, etc.
      
      // בדוק אם יש session פעיל ביום הזה
      const dayName = DAY_NAMES_EN[dayOfWeek];
      
      const hasAvailableSession = sessions.some(session => isSessionActiveOnDay(session, dayName));
      
      if (hasAvailableSession) {
        datesSet.add(date.toISOString().split('T')[0]); // Use Set.add() to prevent duplicates
      }
    }
    
    // Convert Set back to array and sort by date
    const dates = Array.from(datesSet).sort();
    
    // Cache the result immediately
    const cacheEntry = { data: dates, timestamp: Date.now() };
    classDatesCache.set(cacheKey, cacheEntry);
    
    // Save to localStorage
    const allDatesCache = Object.fromEntries(classDatesCache);
    saveCacheToStorage(STORAGE_KEYS.CLASS_DATES, allDatesCache);
    
    return dates;
  } catch (error) {
    console.error('Error in getAvailableDatesForButtonsFromSessions:', error);
    return [];
  }
};

/**
 * קבלת תאריכים זמינים לפי session ID - גרסה חדשה
 */
export const getAvailableDatesForSession = async (sessionId: string): Promise<string[]> => {
  try {
    // Check cache first
    const cacheKey = `session_${sessionId}_dates`;
    const cached = classDatesCache.get(cacheKey);
    if (isCacheValid(cached || null)) {
      return cached!.data;
    }
    
    // Fetch session data with throttling
    const response = await throttledFetch(`${API_BASE_URL}/sessions/${sessionId}`);
    if (!response.ok) {
      console.error('Failed to fetch session data');
      return [];
    }
    
    const session = await response.json();
    
    if (!session || !session.is_active) {
      classDatesCache.set(cacheKey, { data: [], timestamp: Date.now() });
      return [];
    }

    // עבור recurring sessions, ניצור תאריכים לפי ה-weekdays
    const datesSet = new Set<string>(); // Use Set to prevent duplicates
    const today = new Date();
    
    // ניצור תאריכים לטווח ימים מוגדר מראש
    for (let i = 0; i < BOOKING_DAYS_AHEAD; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, etc.
      
      // בדוק אם ה-session פעיל ביום הזה
      const dayName = DAY_NAMES_EN[dayOfWeek];
      
      const isAvailable = isSessionActiveOnDay(session, dayName);
      
      if (isAvailable) {
        datesSet.add(date.toISOString().split('T')[0]); // Use Set.add() to prevent duplicates
      }
    }
    
    // Convert Set back to array and sort by date
    const dates = Array.from(datesSet).sort();
    
    // Cache the result immediately
    const cacheEntry = { data: dates, timestamp: Date.now() };
    classDatesCache.set(cacheKey, cacheEntry);
    
    // Save to localStorage
    const allDatesCache = Object.fromEntries(classDatesCache);
    saveCacheToStorage(STORAGE_KEYS.CLASS_DATES, allDatesCache);
    
    return dates;
  } catch (error) {
    console.error('Error in getAvailableDatesForSession:', error);
    return [];
  }
};

/**
 * קבלת שעות זמינות לפי session ID ותאריך - גרסה חדשה
 */
export const getAvailableTimesForSessionAndDate = async (
  sessionId: string, 
  selectedDate: string
): Promise<string[]> => {
  try {
    // Check cache first
    const cacheKey = `session_${sessionId}_${selectedDate}_times`;
    const cached = classTimesCache.get(cacheKey);
    if (isCacheValid(cached || null)) {
      return cached!.data;
    }
    
    // Fetch session data with throttling
    const response = await throttledFetch(`${API_BASE_URL}/sessions/${sessionId}`);
    if (!response.ok) {
      console.error('Failed to fetch session data');
      return [];
    }
    
    const session = await response.json();
    
    if (!session || !session.is_active) {
      classTimesCache.set(cacheKey, { data: [], timestamp: Date.now() });
      return [];
    }

    // בדוק איזה יום זה
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, etc.
    
    // בדוק אם ה-session פעיל ביום הזה
    const dayName = DAY_NAMES_EN[dayOfWeek];
    
    const isAvailable = isSessionActiveOnDay(session, dayName);
    
    if (!isAvailable) {
      classTimesCache.set(cacheKey, { data: [], timestamp: Date.now() });
      return [];
    }
    
    // החזר את השעה של ה-session
    const time = formatTimeForDisplay(session);
    const times = [time];
    
    // Cache the result immediately
    const cacheEntry = { data: times, timestamp: Date.now() };
    classTimesCache.set(cacheKey, cacheEntry);
    
    // Save to localStorage
    const allTimesCache = Object.fromEntries(classTimesCache);
    saveCacheToStorage(STORAGE_KEYS.CLASS_TIMES, allTimesCache);
    
    return times;
  } catch (error) {
    console.error('Error in getAvailableTimesForSessionAndDate:', error);
    return [];
  }
};

/**
 * קבלת שעות זמינות לפי תאריך - גרסה חדשה עם sessions ו-cache משופר
 */
export const getAvailableTimesForDateFromSessions = async (
  classId: string, 
  selectedDate: string
): Promise<string[]> => {
  try {
    // Check cache first
    const cacheKey = `${classId}_${selectedDate}_times`;
    const cached = classTimesCache.get(cacheKey);
    if (isCacheValid(cached || null)) {
      return cached!.data;
    }
    
    const sessions = await getAvailableSessionsForClass(classId);
    
    if (sessions.length === 0) {
      classTimesCache.set(cacheKey, { data: [], timestamp: Date.now() });
      return [];
    }

    // בדוק איזה יום זה
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, etc.
    
    // מצא sessions שפעילים ביום הזה
    const dayName = DAY_NAMES_EN[dayOfWeek];
    
    const availableSessions = sessions.filter(session => isSessionActiveOnDay(session, dayName));
    
    // החזר את השעות הזמינות עם פורמט נקי - מניעת כפילויות
    const timesSet = new Set<string>();
    availableSessions.forEach(session => {
      timesSet.add(formatTimeForDisplay(session));
    });
    
    // Convert Set back to array and sort by time
    const times = Array.from(timesSet).sort();
    
    // Cache the result immediately
    const cacheEntry = { data: times, timestamp: Date.now() };
    classTimesCache.set(cacheKey, cacheEntry);
    
    // Save to localStorage
    const allTimesCache = Object.fromEntries(classTimesCache);
    saveCacheToStorage(STORAGE_KEYS.CLASS_TIMES, allTimesCache);
    
    return times;
  } catch (error) {
    console.error('Error in getAvailableTimesForDateFromSessions:', error);
    return [];
  }
};

/**
 * בדיקת מקומות זמינים לשיעור בתאריך ושעה מסוימים - גרסה חדשה עם sessions ו-debouncing
 */
export const getAvailableSpotsFromSessions = async (
  classId: string, 
  selectedDate: string, 
  selectedTime: string
): Promise<{ available: number; message: string; sessionId?: string; sessionClassId?: string }> => {
  // Add timeout to prevent hanging
  const timeoutPromise = createTimeoutPromise(TIMEOUTS.SPOTS_CHECK, 'Timeout: Function took too long to complete');
  
  const spotsPromise = (async () => {
    try {
      // קבל את ה-sessions עבור השיעור
      const sessions = await getAvailableSessionsForClass(classId);

      if (sessions.length === 0) {
        return { available: 0, message: 'לא נמצא session זמין' };
      }

      // בדוק איזה יום זה
      const date = new Date(selectedDate);
      const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, etc.
      const dayName = DAY_NAMES_EN[dayOfWeek];
      
      // מצא session שפעיל ביום הזה ובשעה הזו
      const matchingSession = sessions.find(session => {
        const hasMatchingDay = isSessionActiveOnDay(session, dayName);
        const sessionTimeDisplay = formatTimeForDisplay(session);
        const hasMatchingTime = sessionTimeDisplay === selectedTime;
        
        return hasMatchingDay && hasMatchingTime;
      });

      if (!matchingSession) {
        return { available: 0, message: 'השיעור לא זמין ביום ובשעה אלה' };
      }

      // Use cached session classes if available
      let allSessionClasses;
      if (isCacheValid(sessionClassesCache)) {
        allSessionClasses = sessionClassesCache!.data;
      } else {
        const sessionClassesResponse = await throttledFetch(`${API_BASE_URL}/sessions/session-classes`);
        if (!sessionClassesResponse.ok) {
          return { available: 0, message: 'שגיאה בקבלת פרטי session' };
        }
        allSessionClasses = await sessionClassesResponse.json();
        sessionClassesCache = { data: allSessionClasses, timestamp: Date.now() };
      }
      
      let sessionClass = allSessionClasses.find((sc: any) => 
        sc.session_id === matchingSession.id && 
        sc.class_id === classId && 
        sc.is_active === true
      );

      // If no session_class exists, try to create one
      if (!sessionClass) {
        try {
          const { data: newSessionClass, error: newSessionClassError } = await apiService.sessionClasses.create({
            session_id: matchingSession.id,
            class_id: classId,
            price: 0, // Placeholder, will be updated with class data
            is_trial: false, // Placeholder, will be updated with class data
            max_uses_per_user: null // Placeholder, will be updated with class data
          });

          if (newSessionClassError) {
            console.error(`Error creating new session_class for session_id: ${matchingSession.id}, class_id: ${classId}:`, newSessionClassError);
            throw new Error(`Failed to create new session_class`);
          }

          sessionClass = newSessionClass;
        } catch (createError) {
          console.error('Error creating session_class:', createError);
          return { available: 0, message: 'השיעור לא זמין בsession זה' };
        }
      }

      // בדיקה אם זה שיעור פרטי - נשתמש ב-API במקום Supabase ישירות
      try {
        const classResponse = await throttledFetch(`${API_BASE_URL}/classes/${classId}`);
        if (classResponse.ok) {
          const classData = await classResponse.json();
          
          // Flow decision: if appointment_only, consider always available
          if ((classData.registration_type || '').toLowerCase() === 'appointment_only') {
            return { available: 1, message: 'זמין', sessionId: matchingSession.id, sessionClassId: sessionClass.id };
          }
        }
      } catch (apiError) {
        // Continue with normal flow if we can't check
      }
      
      // ספור הרשמות קיימות לתאריך זה - נשתמש ב-API החדש
      try {
        const spotsResponse = await throttledFetch(`${API_BASE_URL}/sessions/capacity/${classId}/${selectedDate}/${selectedTime}`);
        
        if (spotsResponse.ok) {
          const spotsData = await spotsResponse.json();
          
          return { 
            available: spotsData.available, 
            message: spotsData.message, 
            sessionId: spotsData.sessionId, 
            sessionClassId: spotsData.sessionClassId 
          };
        } else {
          // Fallback to max capacity if API fails
          const availableSpots = matchingSession.max_capacity;
          const message = generateAvailabilityMessage(availableSpots);
          
          return { available: availableSpots, message, sessionId: matchingSession.id, sessionClassId: sessionClass.id };
        }
      } catch (apiError) {
        // Fallback to max capacity if API fails
        const availableSpots = matchingSession.max_capacity;
        const message = generateAvailabilityMessage(availableSpots);
        
        const result = { available: availableSpots, message, sessionId: matchingSession.id, sessionClassId: sessionClass.id };
        return result;
      }
    } catch (error) {
      return { available: 0, message: 'שגיאה בבדיקת מקומות זמינים' };
    }
  })();
  
  // Race between timeout and spots promise
  return Promise.race([spotsPromise, timeoutPromise]);
};

/**
 * קבלת כל הזמינות לכל השעות של שיעור בתאריך מסוים - גרסה חדשה עם batch API
 */
export const getAvailableSpotsBatchFromSessions = async (
  classId: string, 
  selectedDate: string
): Promise<{ [time: string]: { available: number; message: string; sessionId?: string; sessionClassId?: string } }> => {
  try {
    const spotsData = await apiService.sessions.getBatchCapacity(classId, selectedDate);
    
    // Convert array to object with time as key
    const spotsObject: { [time: string]: { available: number; message: string; sessionId?: string; sessionClassId?: string } } = {};
    
    spotsData.forEach((spot: any) => {
      spotsObject[spot.time] = {
        available: spot.available,
        message: spot.message,
        sessionId: spot.sessionId,
        sessionClassId: spot.sessionClassId
      };
    });
    
    return spotsObject;
  } catch (error) {
    console.error('Error in getAvailableSpotsBatchFromSessions:', error);
    throw error;
  }
};

/**
 * קבלת הודעה על התאריכים הזמינים - גרסה חדשה עם sessions
 */
export const getAvailableDatesMessageFromSessions = async (classId: string): Promise<string> => {
  try {
    const sessions = await getAvailableSessionsForClass(classId);
    
    if (sessions.length === 0) {
      return 'אין תאריכים זמינים';
    }
    
    // Group sessions by day of week
    const availableDays = new Set<string>();
    
    sessions.forEach(session => {
      session.weekdays.forEach((weekday: any) => {
        // weekday can be a string from JSONB array like "monday", "Tuesday"
        const weekdayLower = typeof weekday === 'string' ? weekday.toLowerCase() : weekday;
        const dayIndex = DAY_NAMES_EN.indexOf(weekdayLower as any);
        if (dayIndex !== -1) {
          availableDays.add(DAY_NAMES_HE[dayIndex]);
        }
      });
    });
    
    return `${Array.from(availableDays).join(', ')}`;
  } catch (error) {
    return 'כל התאריכים זמינים';
  }
};

/**
 * קבלת הודעה על זמינות לפי session ID - גרסה חדשה
 */
export const getAvailableDatesMessageForSession = async (sessionId: string): Promise<string> => {
  try {
    const dates = await getAvailableDatesForSession(sessionId);
    
    if (dates.length === 0) {
      return 'אין תאריכים זמינים השבוע';
    }
    
    if (dates.length === 1) {
      return `תאריך זמין אחד השבוע`;
    }
    
    return `${dates.length} תאריכים זמינים השבוע`;
  } catch (error) {
    console.error('Error in getAvailableDatesMessageForSession:', error);
    return 'שגיאה בטעינת זמינות';
  }
};

/**
 * פונקציה לניקוי cache - לשימוש בעת צורך
 */
export const clearSessionsCache = () => {
  sessionsCache = null;
  sessionClassesCache = null;
  classSessionsCache.clear();
  classDatesCache.clear();
  classTimesCache.clear();
  
  // Reset throttling state
  lastRequestTime = 0;
  isRequestInProgress = false;
  requestQueue = [];
  
  // Clear cookies cache
  try {
    // Note: Cookies will be cleared automatically when expired
    // No need to manually remove them
  } catch (error) {
    console.warn('Failed to clear cookies cache:', error);
  }
};
