import { Request, Response, NextFunction } from 'express';
import { supabase } from '../database';
import { AppError } from './errorHandler';
import { User } from '@supabase/supabase-js';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      throw new AppError('Unauthorized', 401);
    }

    req.user = session.user;
    next();
  } catch (error) {
    next(error);
  }
};

export const admin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      throw new AppError('Unauthorized', 401);
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      throw new AppError('Forbidden', 403);
    }

    req.user = session.user;
    next();
  } catch (error) {
    next(error);
  }
}; 