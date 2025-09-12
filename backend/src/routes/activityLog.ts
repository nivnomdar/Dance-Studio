import express from 'express';
import { Request, Response } from 'express';
import { supabase } from '../database';
import { auth } from '../middleware/auth';

const router = express.Router();

// Route to log activity
router.post('/activity-log', auth, async (req: Request, res: Response) => {
  console.log('Activity Log Route: Request received.');
  console.log('Request Body:', req.body);

  const { actionType, details, metadata, severityLevel } = req.body;
  const userId = req.user?.sub || null; // Use req.user.sub for userId from JWT
  const ipAddress = req.ip;
  const userAgent = req.headers['user-agent'];

  console.log(`Extracted: userId=${userId}, actionType=${actionType}, ipAddress=${ipAddress}, userAgent=${userAgent}`);

  try {
    const { data, error } = await supabase.from('activity_log').insert({
      user_id: userId,
      action_type: actionType,
      details: details,
      metadata: metadata,
      ip_address: ipAddress,
      user_agent: userAgent,
      severity_level: severityLevel,
    });

    if (error) {
      console.error('Error inserting activity log to Supabase:', error);
      return res.status(500).json({ error: 'Failed to log activity', details: error.message });
    }

    console.log('Activity logged successfully to Supabase.', data);
    res.status(201).json({ message: 'Activity logged successfully', data });
  } catch (err) {
    console.error('Unexpected error in activity log route:', err);
    res.status(500).json({ error: 'Internal server error', details: (err as Error).message });
  }
});

export default router;
