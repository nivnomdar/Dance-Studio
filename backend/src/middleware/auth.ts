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
    // קבל את ה-token מה-headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No authorization token provided', 401);
    }

    const token = authHeader.substring(7); // הסר את "Bearer "

    // בדוק את ה-token עם Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new AppError('Invalid or expired token', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const admin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // קבל את ה-token מה-headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No authorization token provided', 401);
    }

    const token = authHeader.substring(7);

    // בדוק את ה-token עם Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new AppError('Invalid or expired token', 401);
    }

    // בדוק אם המשתמש הוא מנהל
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      throw new AppError('Access denied. Admin only.', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}; 