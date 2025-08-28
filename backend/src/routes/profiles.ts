import { Router, Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { AppError } from '../middleware/errorHandler';
import { admin } from '../middleware/auth';
import { auth } from '../middleware/auth';
import { logger } from '../utils/logger';
import rateLimit from 'express-rate-limit';

const router = Router();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Rate limiting for terms acceptance - prevent abuse
const termsAcceptanceLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Allow only 5 attempts per minute
  message: {
    error: 'Too many terms acceptance attempts. Please try again later.',
    retryAfter: '60 seconds'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Accept terms endpoint with rate limiting
router.post('/accept-terms', auth, termsAcceptanceLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get user from JWT payload (already verified by auth middleware)
    const user = (req as any).user;
    
    if (!user || !user.sub) {
      throw new AppError('User not authenticated', 401);
    }

    // Update profile with terms_accepted = true
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({ 
        terms_accepted: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.sub)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);
    if (!profile) throw new AppError('Profile not found', 404);

    logger.info('User accepted terms:', { userId: user.sub });
    res.json({ 
      success: true, 
      message: 'Terms accepted successfully',
      profile 
    });
  } catch (error) {
    next(error);
  }
});

// Update marketing consent endpoint
router.post('/update-marketing', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No valid authorization header', 401);
    }

    const token = authHeader.substring(7);
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new AppError('Invalid token', 401);
    }

    const { email, marketing_consent } = req.body;
    
    if (typeof marketing_consent !== 'boolean') {
      throw new AppError('marketing_consent must be a boolean', 400);
    }

    // Update profile with marketing consent and email
    const updateData: any = { 
      marketing_consent,
      updated_at: new Date().toISOString()
    };
    
    if (email && typeof email === 'string') {
      updateData.email = email;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);
    if (!profile) throw new AppError('Profile not found', 404);

    logger.info('User updated marketing consent:', { 
      userId: user.id, 
      marketing_consent,
      emailUpdated: !!email 
    });
    
    res.json({ 
      success: true, 
      message: 'Marketing consent updated successfully',
      profile 
    });
  } catch (error) {
    next(error);
  }
});

// Get all profiles (admin only)
router.get('/admin', admin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info('Admin profiles endpoint called by user:', req.user?.sub);
    
    const { search } = req.query;
    let query = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    // Add search functionality
    if (search && typeof search === 'string' && search.trim()) {
      const searchTerm = search.trim().toLowerCase();
      query = query.or(`email.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`);
    }
    
    const { data: profiles, error } = await query;

    if (error) {
      logger.error('Error fetching profiles:', error);
      throw new AppError('Failed to fetch profiles', 500);
    }

    logger.info('Profiles fetched successfully:', { count: profiles?.length || 0, search: search || 'none' });
    res.json(profiles || []);
  } catch (error) {
    next(error);
  }
});

// Get user profile
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw new AppError(error.message, 404);
    if (!profile) throw new AppError('Profile not found', 404);

    res.json(profile);
  } catch (error) {
    next(error);
  }
});

// Get current user profile (from auth header)
router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No valid authorization header', 401);
    }

    const token = authHeader.substring(7);
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new AppError('Invalid token', 401);
    }

    // Get profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      // If profile doesn't exist, create one
      if (error.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            first_name: '',
            last_name: '',
            role: 'user',
            created_at: new Date().toISOString(),
            is_active: true,
            terms_accepted: false, // User must explicitly accept terms
            marketing_consent: false, // User must explicitly consent to marketing
            last_login_at: new Date().toISOString(),
            language: 'he'
          })
          .select()
          .single();

        if (createError) throw new AppError(createError.message, 400);
        return res.json(newProfile);
      }
      throw new AppError(error.message, 400);
    }

    res.json(profile);
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);
    if (!profile) throw new AppError('Profile not found', 404);

    res.json(profile);
  } catch (error) {
    next(error);
  }
});

// Update current user profile
router.put('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No valid authorization header', 401);
    }

    const token = authHeader.substring(7);
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new AppError('Invalid token', 401);
    }

    // Update profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .update(req.body)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);
    if (!profile) throw new AppError('Profile not found', 404);

    res.json(profile);
  } catch (error) {
    next(error);
  }
});

// Create user profile
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert([req.body])
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    res.status(201).json(profile);
  } catch (error) {
    next(error);
  }
});

export default router; 