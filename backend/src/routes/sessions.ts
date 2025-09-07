import express, { Request, Response, NextFunction } from 'express';
import { supabase } from '../database';
import { logger } from '../utils/logger';
import { admin } from '../middleware/auth';

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
        end_time,
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
  
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  
  return session.weekdays.some((weekday: any) => {
    // Handle number format (0-6) - this is the main case for schedule_sessions
    if (typeof weekday === 'number' && weekday >= 0 && weekday <= 6) {
      return dayNames[weekday] === dayName.toLowerCase();
    }
    
    // Handle string format (e.g., "monday", "Tuesday")
    if (typeof weekday === 'string') {
      const weekdayLower = weekday.toLowerCase();
      const dayNameLower = dayName.toLowerCase();
      return weekdayLower === dayNameLower;
    }
    
    return false;
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

// Get all sessions (public)
router.get('/', async (req: Request, res: Response, _next: NextFunction) => {
  try {
    logger.info('Public sessions endpoint called');
    
    const { data: sessions, error } = await supabase
      .from('schedule_sessions')
      .select('*')
      .eq('is_active', true)
      .order('start_time');

    if (error) {
      logger.error('Error fetching sessions:', error);
      return res.status(500).json({ error: 'Failed to fetch sessions' });
    }

    logger.info('Sessions fetched successfully:', { count: sessions?.length || 0 });
    res.json(sessions);
  } catch (error) {
    logger.error('Error in sessions route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all session classes (public)
router.get('/session-classes', async (req: Request, res: Response, _next: NextFunction) => {
  try {
    logger.info('Public session-classes endpoint called');
    
    // קודם נקבל את כל ה-session_classes בלי join
    const { data: sessionClasses, error } = await supabase
      .from('session_classes')
      .select('*')
      .eq('is_active', true)
      .order('created_at');

    if (error) {
      logger.error('Error fetching session classes:', error);
      return res.status(500).json({ error: 'Failed to fetch session classes' });
    }

    logger.info('Session classes fetched successfully:', { count: sessionClasses?.length || 0 });
    res.json(sessionClasses);
  } catch (error) {
    logger.error('Error in session classes route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all sessions (admin only)
router.get('/admin', admin, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    logger.info('Admin sessions endpoint called by user:', req.user?.sub);
    
    const { data: sessions, error } = await supabase
      .from('schedule_sessions')
      .select('*')
      .order('start_time');

    if (error) {
      logger.error('Error fetching sessions:', error);
      return res.status(500).json({ error: 'Failed to fetch sessions' });
    }

    logger.info('Sessions fetched successfully:', { count: sessions?.length || 0 });
    res.json(sessions);
  } catch (error) {
    logger.error('Error in sessions route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all session classes (admin only)
router.get('/admin/session-classes', admin, async (req, res, _next) => {
  try {
    logger.info('Admin session-classes endpoint called by user:', req.user?.sub);
    
    // קודם נקבל את כל ה-session_classes בלי join
    const { data: sessionClasses, error } = await supabase
      .from('session_classes')
      .select('*')
      .order('created_at');

    if (error) {
      logger.error('Error fetching session classes:', error);
      return res.status(500).json({ error: 'Failed to fetch session classes' });
    }

    logger.info('Session classes fetched successfully:', { count: sessionClasses?.length || 0 });
    res.json(sessionClasses);
  } catch (error) {
    logger.error('Error in session classes route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get session classes by class ID
router.get('/session-classes/class/:classId', async (req: Request, res: Response, _next: NextFunction) => {
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
router.get('/:id', async (req: Request, res: Response, _next: NextFunction) => {
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
router.get('/:id/classes', async (req: Request, res: Response, _next: NextFunction) => {
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
          instructor_name,
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
router.get('/available/:startDate/:endDate', async (req: Request, res: Response, _next: NextFunction) => {
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
router.get('/spots/:sessionId/:date/:time', async (req: Request, res: Response, _next: NextFunction) => {
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
router.get('/capacity/batch/:classId/:date', async (req: Request, res: Response, _next: NextFunction) => {
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
      
      // Check if session has valid start_time and end_time
      if (!session || !session.start_time || !session.end_time) {
        logger.warn(`Session ${session?.id || 'unknown'} missing start_time or end_time`);
        return null;
      }
      
      // Format time as start_time עד end_time
      const startTime = session.start_time.substring(0, 5); // Format as HH:MM
      const endTime = session.end_time.substring(0, 5); // Format as HH:MM
      const time = `${startTime} עד ${endTime}`;
      
      // Count registrations for this session, date, and time
      const takenSpots = await countRegistrations(session.id, date, startTime); // Use start_time for registration lookup
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

    // Filter out null results and sort by time ascending
    const validResults = results.filter(result => result !== null).sort((a, b) => a!.time.localeCompare(b!.time));
    res.json(validResults);
  } catch (error) {
    logger.error('Error in batch capacity route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get session details with capacity for a specific class, date, and time
router.get('/capacity/:classId/:date/:time', async (req: Request, res: Response, _next: NextFunction) => {
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
      
      // Check if session has valid start_time and end_time
      if (!session || !session.start_time || !session.end_time) {
        return false;
      }
      
      // Check if session is active on this day and time
      const hasMatchingDay = isSessionActiveOnDay(session, dayName);
      
      // Check if session matches the time format (start_time עד end_time)
      const sessionStartTime = session.start_time.substring(0, 5); // Format as HH:MM
      const sessionEndTime = session.end_time.substring(0, 5); // Format as HH:MM
      const sessionTimeDisplay = `${sessionStartTime} עד ${sessionEndTime}`;
      const hasMatchingTime = sessionTimeDisplay === time;
      
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

// Create new session
router.post('/', admin, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const {
      name,
      description,
      weekdays,
      start_time,
      end_time,
      max_capacity,
      address,
      is_active,
      linkedClasses
    } = req.body;

    // Calculate duration in minutes
    const calculateDuration = (start: string, end: string): number => {
      const startTime = new Date(`2000-01-01T${start}`);
      const endTime = new Date(`2000-01-01T${end}`);
      const diffMs = endTime.getTime() - startTime.getTime();
      return Math.round(diffMs / (1000 * 60)); // Convert to minutes
    };

    logger.info(`Creating new session: ${name}`);

    // Validate required fields
    if (!name || !weekdays || !start_time || !end_time || !max_capacity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate weekdays array
    if (!Array.isArray(weekdays) || weekdays.length === 0) {
      return res.status(400).json({ error: 'Weekdays must be a non-empty array' });
    }

    // Validate time format
    if (start_time >= end_time) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    // Validate max capacity
    if (max_capacity <= 0) {
      return res.status(400).json({ error: 'Max capacity must be greater than 0' });
    }

    const { data: session, error } = await supabase
      .from('schedule_sessions')
      .insert({
        name,
        description,
        weekdays,
        start_time,
        end_time,
        max_capacity,
        address: address || 'רחוב יוסף לישנסקי 6 ראשון לציון ישראל',
        duration_minutes: calculateDuration(start_time, end_time),
        is_active: is_active !== undefined ? is_active : true
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating session:', error);
      return res.status(500).json({ error: 'Failed to create session' });
    }

    // Handle linked classes if provided
    if (linkedClasses && Array.isArray(linkedClasses) && linkedClasses.length > 0) {
      const sessionClassData = linkedClasses.map((linkedClass: any) => ({
        session_id: session.id,
        class_id: linkedClass.class_id,
        price: linkedClass.price,
        is_trial: linkedClass.is_trial || false,
        max_uses_per_user: linkedClass.is_trial ? linkedClass.max_uses_per_user : null,
        is_active: true
      }));

      const { error: sessionClassError } = await supabase
        .from('session_classes')
        .insert(sessionClassData);

      if (sessionClassError) {
        logger.error('Error creating session classes:', sessionClassError);
        // Don't fail the entire request, just log the error
      }
    }

    logger.info(`Session created successfully: ${session.id}`);
    res.status(201).json(session);
  } catch (error) {
    logger.error('Error in create session route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update session
router.put('/:id', admin, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      weekdays,
      start_time,
      end_time,
      max_capacity,
      address,
      is_active,
      linkedClasses
    } = req.body;

    // Calculate duration in minutes
    const calculateDuration = (start: string, end: string): number => {
      const startTime = new Date(`2000-01-01T${start}`);
      const endTime = new Date(`2000-01-01T${end}`);
      const diffMs = endTime.getTime() - startTime.getTime();
      return Math.round(diffMs / (1000 * 60)); // Convert to minutes
    };

    logger.info(`Updating session: ${id}`);

    // Validate required fields
    if (!name || !weekdays || !start_time || !end_time || !max_capacity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate weekdays array
    if (!Array.isArray(weekdays) || weekdays.length === 0) {
      return res.status(400).json({ error: 'Weekdays must be a non-empty array' });
    }

    // Validate time format
    if (start_time >= end_time) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    // Validate max capacity
    if (max_capacity <= 0) {
      return res.status(400).json({ error: 'Max capacity must be greater than 0' });
    }

    const { data: session, error } = await supabase
      .from('schedule_sessions')
      .update({
        name,
        description,
        weekdays,
        start_time,
        end_time,
        max_capacity,
        address: address || 'רחוב יוסף לישנסקי 6 ראשון לציון ישראל',
        duration_minutes: calculateDuration(start_time, end_time),
        is_active: is_active !== undefined ? is_active : true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating session:', error);
      return res.status(500).json({ error: 'Failed to update session' });
    }

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Handle linked classes if provided
    if (linkedClasses !== undefined) {
      // First, remove all existing session classes for this session
      const { error: deleteError } = await supabase
        .from('session_classes')
        .delete()
        .eq('session_id', id);

      if (deleteError) {
        logger.error('Error deleting existing session classes:', deleteError);
        // Don't fail the entire request, just log the error
      }

      // Then, add the new linked classes if any
      if (Array.isArray(linkedClasses) && linkedClasses.length > 0) {
        const sessionClassData = linkedClasses.map((linkedClass: any) => ({
          session_id: id,
          class_id: linkedClass.class_id,
          price: linkedClass.price,
          is_trial: linkedClass.is_trial || false,
          max_uses_per_user: linkedClass.is_trial ? linkedClass.max_uses_per_user : null,
          is_active: true
        }));

        const { error: sessionClassError } = await supabase
          .from('session_classes')
          .insert(sessionClassData);

        if (sessionClassError) {
          logger.error('Error creating session classes:', sessionClassError);
          // Don't fail the entire request, just log the error
        }
      }
    }

    logger.info(`Session updated successfully: ${session.id}`);
    res.json(session);
  } catch (error) {
    logger.error('Error in update session route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete session
router.delete('/:id', admin, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const { id } = req.params;

    logger.info(`Deleting session: ${id}`);

    // Check if session exists
    const { data: existingSession, error: fetchError } = await supabase
      .from('schedule_sessions')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingSession) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Delete session
    const { error } = await supabase
      .from('schedule_sessions')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Error deleting session:', error);
      return res.status(500).json({ error: 'Failed to delete session' });
    }

    logger.info(`Session deleted successfully: ${id}`);
    res.status(204).send();
  } catch (error) {
    logger.error('Error in delete session route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Session Classes Management Routes

// Get all session classes
router.get('/session-classes/all', admin, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const { data: sessionClasses, error } = await supabase
      .from('session_classes')
      .select(`
        *,
        schedule_sessions (
          id,
          name,
          description
        ),
        classes (
          id,
          name,
          description
        )
      `)
      .order('created_at', { ascending: false });

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

// Add class to session
router.post('/session-classes', admin, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const { session_id, class_id, price, is_trial, max_uses_per_user } = req.body;

    logger.info(`Adding class ${class_id} to session ${session_id}`);

    // Validate required fields
    if (!session_id || !class_id || price === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if session exists
    const { data: session, error: sessionError } = await supabase
      .from('schedule_sessions')
      .select('id')
      .eq('id', session_id)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check if class exists
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('id')
      .eq('id', class_id)
      .single();

    if (classError || !classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Check if link already exists
    const { data: existingLink } = await supabase
      .from('session_classes')
      .select('id')
      .eq('session_id', session_id)
      .eq('class_id', class_id)
      .single();

    if (existingLink) {
      return res.status(409).json({ error: 'Class is already linked to this session' });
    }

    // Create the link
    const { data: sessionClass, error } = await supabase
      .from('session_classes')
      .insert({
        session_id,
        class_id,
        price,
        is_trial: is_trial || false,
        max_uses_per_user: is_trial ? max_uses_per_user : null,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating session class:', error);
      return res.status(500).json({ error: 'Failed to create session class' });
    }

    logger.info(`Session class created successfully: ${sessionClass.id}`);
    res.status(201).json(sessionClass);
  } catch (error) {
    logger.error('Error in create session class route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove class from session
router.delete('/session-classes/:sessionId/:classId', admin, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const { sessionId, classId } = req.params;

    logger.info(`Removing class ${classId} from session ${sessionId}`);

    // Check if link exists
    const { data: existingLink, error: fetchError } = await supabase
      .from('session_classes')
      .select('id')
      .eq('session_id', sessionId)
      .eq('class_id', classId)
      .single();

    if (fetchError || !existingLink) {
      return res.status(404).json({ error: 'Session class link not found' });
    }

    // Delete the link
    const { error } = await supabase
      .from('session_classes')
      .delete()
      .eq('session_id', sessionId)
      .eq('class_id', classId);

    if (error) {
      logger.error('Error deleting session class:', error);
      return res.status(500).json({ error: 'Failed to delete session class' });
    }

    logger.info(`Session class deleted successfully: ${sessionId}/${classId}`);
    res.status(204).send();
  } catch (error) {
    logger.error('Error in delete session class route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 