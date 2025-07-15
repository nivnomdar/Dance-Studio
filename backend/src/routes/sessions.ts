import express from 'express';
import { supabase } from '../database';
import { logger } from '../utils/logger';

const router = express.Router();

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

export default router; 