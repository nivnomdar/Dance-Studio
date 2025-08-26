import { Router, Request, Response, NextFunction } from 'express';
import { supabase } from '../database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { config } from '../config';
import { 
  setAuthCookie, 
  setSessionCookie, 
  clearCookie, 
  clearAllCookies 
} from '../utils/cookieManager';

const router = Router();

// Get current session
router.get('/session', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      throw new AppError('Failed to get session', 500);
    }
    
    if (session) {
      // Set secure session cookies
      setSessionCookie(res, 'ladances-session-id', session.access_token, 24 * 60 * 60); // 24 שעות
      setAuthCookie(res, 'ladances-user-id', session.user.id, 7 * 24 * 60 * 60); // שבוע
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
        redirectTo: `${req.headers.origin || config.cors.origin}/auth/v1/callback`,
        queryParams: {
          access_type: 'offline', // נשאר לקבלת refresh token
        }
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

    // Clear all application cookies
    clearAllCookies(res);
    
    res.json({ message: 'Signed out successfully' });
  } catch (error) {
    next(error);
  }
});

export default router; 