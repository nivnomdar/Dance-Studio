import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { supabase } from '../database';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

const router = express.Router();

// Public endpoint to submit a contact message (no auth required)
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone, subject, message, contact_terms_accepted, contact_terms_accepted_at } = req.body || {};

    if (!name || !email || !message || !contact_terms_accepted || !contact_terms_accepted_at) {
      throw new AppError('Missing required fields: name, email, message, contact_terms_accepted, and contact_terms_accepted_at are required', 400);
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError('Invalid email format', 400);
    }

    // Collect metadata
    const source_ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || null;
    const user_agent = req.headers['user-agent'] || null;
    const referrer = (req.headers['referer'] as string) || (req.headers['referrer'] as string) || null;

    // Try to extract user id if token exists (optional)
    let user_id: string | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user?.id) {
        user_id = user.id;
      }
    }

    const insertPayload: any = {
      name,
      email,
      phone: phone || null,
      subject: subject || null,
      message,
      status: 'new',
      user_id,
      source_ip,
      user_agent,
      referrer,
      contact_terms_accepted,
      contact_terms_accepted_at
    };

    const { data, error } = await supabase
      .from('contact_messages')
      .insert(insertPayload)
      .select('*')
      .single();

    if (error) {
      logger.error('Failed to insert contact message', error);
      throw new Error('Failed to submit contact message');
    }

    res.status(201).json({ message: 'Contact message submitted successfully', id: data.id });
  } catch (error) {
    next(error);
  }
});

export default router;


