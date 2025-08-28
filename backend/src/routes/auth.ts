import { Router, Request, Response, NextFunction } from 'express';
import { supabase } from '../database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { config } from '../config';
import rateLimit from 'express-rate-limit';
import { 
  setAuthCookie, 
  setSessionCookie, 
  clearCookie, 
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

// Check terms acceptance status for user with rate limiting
router.get('/terms-status', termsStatusLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get user from auth header (JWT token)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No valid authorization token provided', 401);
    }

    const token = authHeader.substring(7);
    
    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new AppError('Invalid or expired token', 401);
    }

    // Get user's profile from database to check terms acceptance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('terms_accepted, marketing_consent, email')
      .eq('id', user.id)
      .single();

    if (profileError) {
      logger.error('Error fetching profile for terms validation:', profileError);
      throw new AppError('Failed to validate user profile', 500);
    }

    if (!profile) {
      throw new AppError('User profile not found', 404);
    }

    // Return terms status
    res.json({
      success: true,
      userId: user.id,
      email: profile.email,
      terms_accepted: profile.terms_accepted,
      marketing_consent: profile.marketing_consent,
      requires_terms_acceptance: !profile.terms_accepted
    });

    logger.info(`Terms status checked for user ${user.id}: terms_accepted=${profile.terms_accepted}`);
    
  } catch (error) {
    next(error);
  }
});

export default router; 