import { Session, SessionClass } from '../types/sessions';
import { API_BASE_URL, CACHE_DURATION, DAY_NAMES_EN, DAY_NAMES_HE, TIMEOUTS, createTimeoutPromise } from './constants';

// Cache for sessions data to prevent excessive API calls
let sessionsCache: { data: any[]; timestamp: number } | null = null;
let sessionClassesCache: { data: any[]; timestamp: number } | null = null;

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
const formatTimeForDisplay = (time: string): string => {
  // אם השעה בפורמט HH:MM:SS, נחזיר רק HH:MM
  if (time && time.includes(':')) {
    const parts = time.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
  }
  return time;
};

/**
 * קבלת sessions זמינים לפי class ID
 */
export const getAvailableSessionsForClass = async (classId: string): Promise<Session[]> => {
  try {
    const now = Date.now();
    
    // Check if we have valid cached data
    if (sessionsCache && sessionClassesCache && 
        (now - sessionsCache.timestamp) < CACHE_DURATION && 
        (now - sessionClassesCache.timestamp) < CACHE_DURATION) {
      
      const allSessions = sessionsCache.data;
      const allSessionClasses = sessionClassesCache.data;
      
      // Filter session classes for this specific class
      const sessionClasses = allSessionClasses.filter((sc: any) => 
        sc.class_id === classId && sc.is_active === true
      );
      
      if (sessionClasses.length === 0) {
        return [];
      }
      
      // Get session IDs for this class
      const sessionIds = sessionClasses.map((sc: any) => sc.session_id);
      
      // Filter sessions for this class
      const sessions = allSessions.filter((session: any) => 
        sessionIds.includes(session.id) && session.is_active === true
      );
      

      
      return sessions || [];
    }
    
    // Get all sessions from API
    const sessionsResponse = await fetch(`${API_BASE_URL}/sessions`);
    if (!sessionsResponse.ok) {

      return [];
    }
    const allSessions = await sessionsResponse.json();
    
    // Cache the sessions data
    sessionsCache = { data: allSessions, timestamp: now };
    
    // Get session classes from API
    const sessionClassesResponse = await fetch(`${API_BASE_URL}/sessions/session-classes`);
    if (!sessionClassesResponse.ok) {

      return [];
    }
    const allSessionClasses = await sessionClassesResponse.json();
    
    // Cache the session classes data
    sessionClassesCache = { data: allSessionClasses, timestamp: now };
    
    // Filter session classes for this specific class
    const sessionClasses = allSessionClasses.filter((sc: any) => 
      sc.class_id === classId && sc.is_active === true
    );
    
    if (sessionClasses.length === 0) {
      return [];
    }
    
    // Get session IDs for this class
    const sessionIds = sessionClasses.map((sc: any) => sc.session_id);
    
    // Filter sessions for this class
    const sessions = allSessions.filter((session: any) => 
      sessionIds.includes(session.id) && session.is_active === true
    );
    

    
    return sessions || [];
  } catch (error) {

    return [];
  }
};

/**
 * קבלת תאריכים זמינים לכפתורים - גרסה חדשה עם sessions
 */
export const getAvailableDatesForButtonsFromSessions = async (classId: string): Promise<string[]> => {
  try {
    const sessions = await getAvailableSessionsForClass(classId);
    
    if (sessions.length === 0) {
      return [];
    }

    // עבור recurring sessions, ניצור תאריכים לפי ה-weekdays
    const dates: string[] = [];
    const today = new Date();
    
    // ניצור תאריכים לשבוע הבא
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, etc.
      
      // בדוק אם ה-session פעיל ביום הזה
      const dayName = DAY_NAMES_EN[dayOfWeek];
      
      const isAvailable = sessions.some(session => {
        const sessionActive = session.is_active;
        const dayAvailable = session.weekdays.some((weekday: any) => {
          // weekday can be a string from JSONB array like "monday", "Tuesday"
          const weekdayLower = typeof weekday === 'string' ? weekday.toLowerCase() : weekday;
          const dayNameLower = dayName.toLowerCase();
          return weekdayLower === dayNameLower;
        });
        return sessionActive && dayAvailable;
      });
      
      if (isAvailable) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    
    return dates;
  } catch (error) {

    return [];
  }
};

/**
 * קבלת שעות זמינות לפי תאריך - גרסה חדשה עם sessions
 */
export const getAvailableTimesForDateFromSessions = async (
  classId: string, 
  selectedDate: string
): Promise<string[]> => {
  try {
    const sessions = await getAvailableSessionsForClass(classId);
    
    if (sessions.length === 0) {
      return [];
    }

    // בדוק איזה יום זה
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, etc.
    
    // מצא sessions שפעילים ביום הזה
    const dayName = DAY_NAMES_EN[dayOfWeek];
    
    const availableSessions = sessions.filter(session => 
      session.is_active && 
      session.weekdays.some((weekday: any) => {
        // weekday can be a string from JSONB array like "monday", "Tuesday"
        const weekdayLower = typeof weekday === 'string' ? weekday.toLowerCase() : weekday;
        const dayNameLower = dayName.toLowerCase();
        return weekdayLower === dayNameLower;
      })
    );
    
    // החזר את השעות הזמינות עם פורמט נקי
    return availableSessions.map(session => formatTimeForDisplay(session.start_time));
  } catch (error) {

    return [];
  }
};

/**
 * בדיקת מקומות זמינים לשיעור בתאריך ושעה מסוימים - גרסה חדשה עם sessions
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
      const isActive = session.is_active;
      
      // Fix weekday matching - handle JSONB array format
      const hasMatchingDay = session.weekdays.some((weekday: any) => {
        // weekday can be a string from JSONB array like "monday", "Tuesday"
        const weekdayLower = typeof weekday === 'string' ? weekday.toLowerCase() : weekday;
        const dayNameLower = dayName.toLowerCase();

        return weekdayLower === dayNameLower;
      });
      
      const hasMatchingTime = formatTimeForDisplay(session.start_time) === selectedTime;
      

      
      return isActive && hasMatchingDay && hasMatchingTime;
    });

    if (!matchingSession) {
      return { available: 0, message: 'השיעור לא זמין ביום ובשעה אלה' };
    }

    // קבל את ה-session class דרך ה-API
    const sessionClassesResponse = await fetch(`${API_BASE_URL}/sessions/session-classes`);
    if (!sessionClassesResponse.ok) {

      return { available: 0, message: 'שגיאה בקבלת פרטי session' };
    }
    
    const allSessionClasses = await sessionClassesResponse.json();
    
    const sessionClass = allSessionClasses.find((sc: any) => 
      sc.session_id === matchingSession.id && 
      sc.class_id === classId && 
      sc.is_active === true
    );
    


    if (!sessionClass) {
      return { available: 0, message: 'השיעור לא זמין בsession זה' };
    }

    // בדיקה אם זה שיעור פרטי - נשתמש ב-API במקום Supabase ישירות
    try {
      const classResponse = await fetch(`${API_BASE_URL}/classes/${classId}`);
      if (classResponse.ok) {
        const classData = await classResponse.json();
        
        // אם זה שיעור פרטי, אין צורך לבדוק מקומות
        if (classData.slug === 'private-lesson' || classData.category === 'private') {
          return { available: 1, message: 'זמין', sessionId: matchingSession.id, sessionClassId: sessionClass.id };
        }
      }
    } catch (apiError) {
      // Continue with normal flow if we can't check
    }
    
    // ספור הרשמות קיימות לתאריך זה - נשתמש ב-API החדש
    try {
      const spotsResponse = await fetch(`${API_BASE_URL}/sessions/capacity/${classId}/${selectedDate}/${selectedTime}`);
      
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
    
    return `השיעורים מתקיימים בימים: ${Array.from(availableDays).join(', ')}`;
  } catch (error) {

    return 'כל התאריכים זמינים';
  }
};

/**
 * פונקציה לדיבוג - בדיקת נתונים בטבלאות
 */
export const debugSessionsData = async (classId: string) => {
  try {
    const { supabase } = await import('../lib/supabase');
    await supabase
      .from('session_classes')
      .select('*')
      .eq('class_id', classId);
    await supabase
      .from('schedule_sessions')
      .select('*');
    await getAvailableDatesForButtonsFromSessions(classId);
  } catch (error) {}
};

/**
 * פונקציה לבדיקת נתונים דרך ה-API
 */
export const testSessionsAPI = async () => {
  try {
    await fetch(`${API_BASE_URL}/sessions`);
    await fetch(`${API_BASE_URL}/sessions/session-classes`);
    await fetch(`${API_BASE_URL}/classes`);
  } catch (error) {}
};

/**
 * פונקציה לבדיקה מהירה של הטבלאות
 */
export const testTablesAccess = async () => {
  try {
    await fetch(`${API_BASE_URL}/sessions/session-classes`);
    await fetch(`${API_BASE_URL}/sessions`);
    return {};
  } catch (error) {
    return { error };
  }
}; 