import express from 'express';
import { supabase } from '../database';
import { logger } from '../utils/logger';

const router = express.Router();

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
 * פונקציה משותפת לקבלת session classes עבור class
 */
const getSessionClassesForClass = async (classId: string) => {
  const { data: sessionClasses, error: scError } = await supabase
    .from('session_classes')
    .select(`
      id,
      session_id,
      schedule_sessions (
        id,
        name,
        max_capacity,
        weekdays,
        start_time,
        is_active
      )
    `)
    .eq('class_id', classId)
    .eq('is_active', true);

  if (scError) {
    throw new Error(`Failed to fetch session classes: ${scError.message}`);
  }

  return sessionClasses || [];
};

/**
 * פונקציה משותפת לקבלת שם היום מהתאריך
 */
const getDayNameFromDate = (date: string): string => {
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay(); // 0=Sunday, 1=Monday, etc.
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return dayNames[dayOfWeek];
};

/**
 * פונקציה משותפת לבדיקה אם session פעיל ביום מסוים
 */
const isSessionActiveOnDay = (session: any, dayName: string): boolean => {
  if (!session || !session.is_active) return false;
  
  return session.weekdays.some((weekday: any) => {
    const weekdayLower = typeof weekday === 'string' ? weekday.toLowerCase() : weekday;
    const dayNameLower = dayName.toLowerCase();
    return weekdayLower === dayNameLower;
  });
};

/**
 * פונקציה משותפת לקבלת session מתוך session class
 */
const getSessionFromSessionClass = (sc: any) => {
  return Array.isArray(sc.schedule_sessions) ? sc.schedule_sessions[0] : sc.schedule_sessions;
};

/**
 * פונקציה משותפת לספירת רישומים
 */
const countRegistrations = async (sessionId: string, date: string, time: string) => {
  const { count, error: countError } = await supabase
    .from('registrations')
    .select('*', { count: 'exact', head: true })
    .eq('session_id', sessionId)
    .eq('selected_date', date)
    .eq('selected_time', time)
    .eq('status', 'active');

  if (countError) {
    throw new Error(`Failed to count registrations: ${countError.message}`);
  }

  return count || 0;
};

// Get all sessions
router.get('/', async (req, res) => {
  try {
    const { data: sessions, error } = await supabase
      .from('schedule_sessions')
      .select('*')
      .order('start_time');

    if (error) {
      logger.error('Error fetching sessions:', error);
      return res.status(500).json({ error: 'Failed to fetch sessions' });
    }

    res.json(sessions);
  } catch (error) {
    logger.error('Error in sessions route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all session classes
router.get('/session-classes', async (req, res) => {
  try {
    // קודם נקבל את כל ה-session_classes בלי join
    const { data: sessionClasses, error } = await supabase
      .from('session_classes')
      .select('*')
      .order('created_at');

    if (error) {
      logger.error('Error fetching session classes:', error);
      return res.status(500).json({ error: 'Failed to fetch session classes' });
    }

    logger.info('Session classes fetched successfully:', sessionClasses);
    res.json(sessionClasses);
  } catch (error) {
    logger.error('Error in session classes route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get session classes by class ID
router.get('/session-classes/class/:classId', async (req, res) => {
  try {
    const { classId } = req.params;
    
    // קודם נקבל את ה-session_classes בלי join
    const { data: sessionClasses, error } = await supabase
      .from('session_classes')
      .select('*')
      .eq('class_id', classId)
      .eq('is_active', true)
      .order('created_at');

    if (error) {
      logger.error('Error fetching session classes for class:', error);
      return res.status(500).json({ error: 'Failed to fetch session classes' });
    }

    logger.info(`Session classes for class ${classId}:`, sessionClasses);
    res.json(sessionClasses);
  } catch (error) {
    logger.error('Error in session classes by class route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get session by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: session, error } = await supabase
      .from('schedule_sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      logger.error('Error fetching session:', error);
      return res.status(500).json({ error: 'Failed to fetch session' });
    }

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    logger.error('Error in session route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get session classes (classes available for a specific session)
router.get('/:id/classes', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: sessionClasses, error } = await supabase
      .from('session_classes')
      .select(`
        *,
        classes (
          id,
          name,
          description,
          price,
          duration,
          color_scheme,
          location
        )
      `)
      .eq('session_id', id);

    if (error) {
      logger.error('Error fetching session classes:', error);
      return res.status(500).json({ error: 'Failed to fetch session classes' });
    }

    res.json(sessionClasses);
  } catch (error) {
    logger.error('Error in session classes route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available sessions for a specific date range
router.get('/available/:startDate/:endDate', async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    
    const { data: sessions, error } = await supabase
      .from('schedule_sessions')
      .select(`
        *,
        session_classes (
          id,
          class_id,
          classes (
            id,
            name,
            description,
            price,
            duration,
            color_scheme,
            instructor_name,
            location
          )
        )
      `)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date, start_time');

    if (error) {
      logger.error('Error fetching available sessions:', error);
      return res.status(500).json({ error: 'Failed to fetch available sessions' });
    }

    res.json(sessions);
  } catch (error) {
    logger.error('Error in available sessions route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get registration count for a specific session, date, and time
router.get('/spots/:sessionId/:date/:time', async (req, res) => {
  try {
    const { sessionId, date, time } = req.params;
    
    logger.info(`Checking spots for session ${sessionId} on ${date} at ${time}`);
    
    // Get the session to check max capacity
    const { data: session, error: sessionError } = await supabase
      .from('schedule_sessions')
      .select('max_capacity')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      logger.error('Error fetching session:', sessionError);
      return res.status(404).json({ error: 'Session not found' });
    }

    // Count registrations for this session, date, and time
    const { count, error: countError } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId)
      .eq('selected_date', date)
      .eq('selected_time', time)
      .eq('status', 'active'); // Only count active registrations

    if (countError) {
      logger.error('Error counting registrations:', countError);
      return res.status(500).json({ error: 'Failed to count registrations' });
    }

    const takenSpots = count || 0;
    const availableSpots = session.max_capacity - takenSpots;
    
    const message = generateAvailabilityMessage(availableSpots);

    logger.info(`Session ${sessionId} on ${date} at ${time}: ${takenSpots}/${session.max_capacity} taken, ${availableSpots} available`);
    
    res.json({
      available: availableSpots,
      message,
      taken: takenSpots,
      maxCapacity: session.max_capacity
    });
  } catch (error) {
    logger.error('Error in spots route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Batch: Get all spots for all times of a class on a given date
router.get('/capacity/batch/:classId/:date', async (req, res) => {
  try {
    const { classId, date } = req.params;
    
    logger.info(`Checking capacity for class batch on ${classId} at ${date}`);
    
    // Get all session classes for this class
    const sessionClasses = await getSessionClassesForClass(classId);

    if (sessionClasses.length === 0) {
      return res.json([]);
    }

    // Find all sessions for this date
    const dayName = getDayNameFromDate(date);

    // Filter all matching sessionClasses for this day
    const matchingSessionClasses = sessionClasses.filter(sc => {
      const session = getSessionFromSessionClass(sc);
      return isSessionActiveOnDay(session, dayName);
    });

    // For each matching session, get the time and available spots
    const results = await Promise.all(matchingSessionClasses.map(async (sc) => {
      const session = getSessionFromSessionClass(sc);
      const time = session.start_time.substring(0, 5); // Format as HH:MM
      
      // Count registrations for this session, date, and time
      const takenSpots = await countRegistrations(session.id, date, time);
      const availableSpots = session.max_capacity - takenSpots;
      const message = generateAvailabilityMessage(availableSpots);
      
      return {
        time,
        available: availableSpots,
        message,
        sessionId: session.id,
        sessionClassId: sc.id
      };
    }));

    // Sort by time ascending
    results.sort((a, b) => a.time.localeCompare(b.time));
    res.json(results);
  } catch (error) {
    logger.error('Error in batch capacity route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get session details with capacity for a specific class, date, and time
router.get('/capacity/:classId/:date/:time', async (req, res) => {
  try {
    const { classId, date, time } = req.params;
    
    logger.info(`Checking capacity for class ${classId} on ${date} at ${time}`);
    
    // Get the session that matches this class, date, and time
    const sessionClasses = await getSessionClassesForClass(classId);

    if (sessionClasses.length === 0) {
      return res.status(404).json({ error: 'No sessions found for this class' });
    }

    // Find the matching session for this date and time
    const dayName = getDayNameFromDate(date);

    const matchingSessionClass = sessionClasses.find(sc => {
      const session = getSessionFromSessionClass(sc);
      
      // Check if session is active on this day and time
      const hasMatchingDay = isSessionActiveOnDay(session, dayName);
      
      // Check if session is at this time
      const sessionTime = session.start_time;
      const formattedSessionTime = sessionTime.substring(0, 5); // Format as HH:MM
      const hasMatchingTime = formattedSessionTime === time;
      
      return hasMatchingDay && hasMatchingTime;
    });

    if (!matchingSessionClass) {
      return res.status(404).json({ error: 'No matching session found for this date and time' });
    }

    const session = getSessionFromSessionClass(matchingSessionClass);
    
    // Count registrations for this session, date, and time
    const takenSpots = await countRegistrations(session.id, date, time);
    const availableSpots = session.max_capacity - takenSpots;
    
    const message = generateAvailabilityMessage(availableSpots);

    logger.info(`Class ${classId} on ${date} at ${time}: ${takenSpots}/${session.max_capacity} taken, ${availableSpots} available`);
    
    res.json({
      available: availableSpots,
      message,
      taken: takenSpots,
      maxCapacity: session.max_capacity,
      sessionId: session.id,
      sessionClassId: matchingSessionClass.id
    });
  } catch (error) {
    logger.error('Error in capacity route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 