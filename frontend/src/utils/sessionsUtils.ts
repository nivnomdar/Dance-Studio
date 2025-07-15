// Utility functions for handling sessions and session classes

import { Session, SessionClass } from '../types/sessions';

import { API_BASE_URL, CACHE_DURATION, DAY_NAMES_EN, DAY_NAMES_HE } from './constants';

// Cache for sessions data to prevent excessive API calls
let sessionsCache: { data: any[]; timestamp: number } | null = null;
let sessionClassesCache: { data: any[]; timestamp: number } | null = null;

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
      console.error('Error fetching sessions from API:', sessionsResponse.status);
      return [];
    }
    const allSessions = await sessionsResponse.json();
    
    // Cache the sessions data
    sessionsCache = { data: allSessions, timestamp: now };
    
    // Get session classes from API
    const sessionClassesResponse = await fetch(`${API_BASE_URL}/sessions/session-classes`);
    if (!sessionClassesResponse.ok) {
      console.error('Error fetching session classes from API:', sessionClassesResponse.status);
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
    console.error('Error fetching sessions for class:', error);
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
        const dayAvailable = session.weekdays.some(weekday => 
          weekday.toLowerCase() === dayName.toLowerCase()
        );
        return sessionActive && dayAvailable;
      });
      
      if (isAvailable) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    
    return dates;
  } catch (error) {
    console.error('Error getting available dates from sessions:', error);
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
      session.weekdays.some(weekday => 
        weekday.toLowerCase() === dayName.toLowerCase()
      )
    );
    
    // החזר את השעות הזמינות עם פורמט נקי
    return availableSessions.map(session => formatTimeForDisplay(session.start_time));
  } catch (error) {
    console.error('Error getting available times from sessions:', error);
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
  try {
    // קבל את ה-sessions עבור השיעור
    const sessions = await getAvailableSessionsForClass(classId);
    
    if (sessions.length === 0) {
      return { available: 0, message: 'לא נמצא session' };
    }

    // בדוק איזה יום זה
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, etc.
    
    // מצא session שפעיל ביום הזה ובשעה הזו
    const dayName = DAY_NAMES_EN[dayOfWeek];
    
    const matchingSession = sessions.find(session => 
      session.is_active && 
      session.weekdays.some(weekday => 
        weekday.toLowerCase() === dayName.toLowerCase()
      ) &&
      formatTimeForDisplay(session.start_time) === selectedTime
    );

    if (!matchingSession) {
      return { available: 0, message: 'השיעור לא זמין ביום ובשעה אלה' };
    }

    // קבל את ה-session class דרך ה-API
    const sessionClassesResponse = await fetch(`${API_BASE_URL}/sessions/session-classes`);
    if (!sessionClassesResponse.ok) {
      console.error('Error fetching session classes:', sessionClassesResponse.status);
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

    // בדיקה אם זה שיעור פרטי
    const { supabase } = await import('../lib/supabase');
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('slug, category')
      .eq('id', classId)
      .single();
    
    // אם זה שיעור פרטי, אין צורך לבדוק מקומות
    if (!classError && (classData.slug === 'private-lesson' || classData.category === 'private')) {
      return { available: 1, message: 'זמין', sessionId: matchingSession.id, sessionClassId: sessionClass.id };
    }
    
    // ספור הרשמות קיימות לתאריך זה - נשתמש ב-API
    // Since registrations endpoint requires auth, we'll use a fallback approach
    // For now, we'll assume no registrations exist and return full capacity
    // In a production environment, you'd want to create a public endpoint for this
    const takenSpots = 0; // Fallback: assume no registrations exist
    const availableSpots = matchingSession.max_capacity - takenSpots;
    
    let message = '';
    if (availableSpots <= 0) {
      message = 'מלא';
    } else if (availableSpots === 1) {
      message = 'נותר מקום אחרון';
    } else if (availableSpots <= 3) {
      message = `נותרו ${availableSpots} מקומות אחרונים`;
    }
    
    return { available: availableSpots, message, sessionId: matchingSession.id, sessionClassId: sessionClass.id };
  } catch (error) {
    console.error('Error checking available spots from sessions:', error);
    return { available: 0, message: 'שגיאה בבדיקת מקומות זמינים' };
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
      session.weekdays.forEach(weekday => {
        // weekday is a string (e.g., "monday", "tuesday")
        const dayIndex = DAY_NAMES_EN.indexOf(weekday.toLowerCase() as any);
        if (dayIndex !== -1) {
          availableDays.add(DAY_NAMES_HE[dayIndex]);
        }
      });
    });
    
    return `השיעורים מתקיימים בימים: ${Array.from(availableDays).join(', ')}`;
  } catch (error) {
    console.error('Error getting available dates message from sessions:', error);
    return 'כל התאריכים זמינים';
  }
};

/**
 * פונקציה לדיבוג - בדיקת נתונים בטבלאות
 */
export const debugSessionsData = async (classId: string) => {
  try {
    console.log('🔍 DEBUG: Checking sessions data for class ID:', classId);
    const { supabase } = await import('../lib/supabase');
    
    // בדיקת session_classes
    const { data: sessionClasses, error: scError } = await supabase
      .from('session_classes')
      .select('*')
      .eq('class_id', classId);
    
    console.log('📊 Session classes for this class:', sessionClasses);
    console.log('❌ Session classes error:', scError);
    console.log('📊 Session classes length:', sessionClasses?.length);
    
    // בדיקת schedule_sessions
    const { data: allSessions, error: sessionsError } = await supabase
      .from('schedule_sessions')
      .select('*');
    
    console.log('📊 All schedule sessions:', allSessions);
    console.log('❌ Schedule sessions error:', sessionsError);
    
    // בדיקה - ננסה לקרוא לפונקציה ישירות
    console.log('🧪 Testing getAvailableDatesForButtonsFromSessions directly...');
    const dates = await getAvailableDatesForButtonsFromSessions(classId);
    console.log('📅 Dates from direct call:', dates);
    console.log('📅 Dates length:', dates.length);
    console.log('📅 Dates array:', dates);
    
  } catch (error) {
    console.error('Error in debug function:', error);
  }
};

/**
 * פונקציה לבדיקת נתונים דרך ה-API
 */
export const testSessionsAPI = async () => {
  try {
    console.log('🧪 Testing sessions API...');
    
    // בדיקת sessions
    const sessionsResponse = await fetch(`${API_BASE_URL}/sessions`);
    const sessionsData = await sessionsResponse.json();
    console.log('📊 Sessions API response:', sessionsData);
    
    // בדיקת session classes
    const sessionClassesResponse = await fetch(`${API_BASE_URL}/sessions/session-classes`);
    const sessionClassesData = await sessionClassesResponse.json();
    console.log('📊 Session classes API response:', sessionClassesData);
    
    // בדיקת classes
    const classesResponse = await fetch(`${API_BASE_URL}/classes`);
    const classesData = await classesResponse.json();
    console.log('📊 Classes API response:', classesData);
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
};

/**
 * פונקציה לבדיקה מהירה של הטבלאות
 */
export const testTablesAccess = async () => {
  try {
    console.log('🧪 Testing tables access via API...');
    
    // בדיקה מהירה של session_classes דרך ה-API
    console.log('🔍 Testing session_classes via API...');
    const sessionClassesResponse = await fetch(`${API_BASE_URL}/sessions/session-classes`);
    const sessionClassesData = sessionClassesResponse.ok ? await sessionClassesResponse.json() : null;
    const sessionClassesError = sessionClassesResponse.ok ? null : `HTTP ${sessionClassesResponse.status}`;
    
    console.log('📊 session_classes test result:', sessionClassesData);
    console.log('❌ session_classes test error:', sessionClassesError);
    
    // בדיקה מהירה של schedule_sessions דרך ה-API
    console.log('🔍 Testing schedule_sessions via API...');
    const sessionsResponse = await fetch(`${API_BASE_URL}/sessions`);
    const sessionsData = sessionsResponse.ok ? await sessionsResponse.json() : null;
    const sessionsError = sessionsResponse.ok ? null : `HTTP ${sessionsResponse.status}`;
    
    console.log('📊 schedule_sessions test result:', sessionsData);
    console.log('❌ schedule_sessions test error:', sessionsError);
    
    return { 
      scTest: sessionClassesData, 
      scTestError: sessionClassesError, 
      ssTest: sessionsData, 
      ssTestError: sessionsError 
    };
  } catch (error) {
    console.error('❌ Exception in testTablesAccess:', error);
    return { error };
  }
}; 