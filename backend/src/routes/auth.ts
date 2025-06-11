import { Router, Request, Response, NextFunction } from 'express';
import { supabase } from '../database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { config } from '../config';

const router = Router();

// Get current session
router.get('/session', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      throw new AppError('Failed to get session', 500);
    }
    
    res.json(session);
  } catch (error) {
    next(error);
  }
});

// Sign in with Google
router.post('/google', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${config.cors.origin}/auth/callback`
      }
    });

    if (error) {
      throw new AppError('Failed to sign in with Google', 500);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Sign out
router.post('/signout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new AppError('Failed to sign out', 500);
    }

    // Clear session cookies
    res.clearCookie('sb-access-token');
    res.clearCookie('sb-refresh-token');
    
    res.json({ message: 'Signed out successfully' });
  } catch (error) {
    next(error);
  }
});

export default router; 