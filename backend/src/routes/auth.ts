import { Router, Request, Response, NextFunction } from 'express';
import { supabase } from '../database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { config } from '../config';
import rateLimit from 'express-rate-limit';
import { auth } from '../middleware/auth';
import {
  setAuthCookie,
  setSessionCookie,
  clearAllCookies
} from '../utils/cookieManager';

const router = Router();

// Rate limiting for terms status checks - prevent excessive calls
const termsStatusLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Allow only 10 checks per minute per IP
  message: {
    error: 'Too many terms status checks. Please try again later.',
    retryAfter: '60 seconds'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Get current session
router.get('/session', async (req: Request, res: Response, _next: NextFunction) => {
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
    _next(error);
  }
});

// Sign in with Google
router.post('/google', async (req: Request, res: Response, _next: NextFunction) => {
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
    _next(error);
  }
});

// Sign out
router.post('/signout', async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new AppError('Failed to sign out', 500);
    }

    // Clear all application cookies
    clearAllCookies(res);
    
    res.json({ message: 'Signed out successfully' });
  } catch (error) {
    _next(error);
  }
});

// Check terms acceptance status for user with rate limiting
router.get('/terms-status', auth, termsStatusLimiter, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    // Get user from JWT payload (already verified by auth middleware)
    const user = (req as any).user;
    
    // Log the user.sub for debugging
    logger.info(`Terms status check for user ID: ${user?.sub}`);

    if (!user || !user.sub) {
      logger.error('Terms status check: User not authenticated or user.sub missing');
      throw new AppError('User not authenticated', 401);
    }

    // Get user's profile from database to check terms acceptance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('terms_accepted, email')
      .eq('id', user.sub)
      .single();

    if (profileError) {
      // Log the specific database error
      logger.error('Error fetching profile for terms validation:', profileError);
      throw new AppError('Failed to validate user profile', 500);
    }

    if (!profile) {
      // Log if profile is not found
      logger.warn(`Terms status check: User profile not found for ID: ${user.sub}`);
      throw new AppError('User profile not found', 404);
    }

    // Return terms status
    res.json({
      success: true,
      userId: user.sub,
      email: profile.email,
      terms_accepted: profile.terms_accepted,
      requires_terms_acceptance: !profile.terms_accepted
    });

    logger.info(`Terms status checked for user ${user.sub}: terms_accepted=${profile.terms_accepted}`);
    
  } catch (error) {
    _next(error);
  }
});

export default router; 