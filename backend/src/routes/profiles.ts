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
router.post('/accept-terms', auth, termsAcceptanceLimiter, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    // Get user from JWT payload (already verified by auth middleware)
    const user = (req as any).user;
    
    if (!user || !user.sub) {
      throw new AppError('User not authenticated', 401);
    }

    const { version, registration_id } = req.body; // Expect version and potentially registration_id

    const commonConsentData: any = {
      user_id: user.sub,
      consent_type: 'terms_and_privacy',
      consented_at: new Date().toISOString(),
    };

    let consentResultData, consentError;

    // If a registration_id is provided, these are per-registration terms.
    // Otherwise, it's a general, one-time terms acceptance (version: null).
    if (registration_id) {
      // Per-registration terms always insert a new record with a version
      commonConsentData.registration_id = String(registration_id);
      commonConsentData.version = version ? String(version) : '1.0'; // Require version for per-registration
      ({ data: consentResultData, error: consentError } = await supabase
        .from('user_consents')
        .insert(commonConsentData));
    } else {
      // For one-time terms (no registration_id), we need to manually handle upsert logic due to partial index limitations
      const { data: existingConsents, error: selectError } = await supabase
        .from('user_consents')
        .select('id')
        .eq('user_id', user.sub)
        .eq('consent_type', 'terms_and_privacy') // Assuming 'terms_and_privacy' is the type for one-time terms
        .is('version', null)
        .single();

      if (selectError && selectError.code !== 'PGRST116') { // PGRST116 means no rows found
        throw new AppError(`Failed to check existing consent: ${selectError.message}`, 500);
      }

      if (existingConsents) {
        // If record exists, update it
        ({ data: consentResultData, error: consentError } = await supabase
          .from('user_consents')
          .update({ ...commonConsentData })
          .eq('id', existingConsents.id));
      } else {
        // If no record exists, insert a new one
        ({ data: consentResultData, error: consentError } = await supabase
          .from('user_consents')
          .insert(commonConsentData));
      }
    }

    if (consentError) { logger.error('Supabase consentError in /accept-terms:', consentError); throw new AppError(consentError.message, 400); }
    
    // No longer updating terms_accepted in the profiles table directly.
    // This is now managed via the user_consents table.
    logger.info('User accepted terms:', { userId: user.sub, registration_id, version });
    res.json({ 
      success: true, 
      message: 'Terms accepted successfully',
      data: consentResultData // Return the consent record
    });
  } catch (error) {
    _next(error);
  }
});

// Generic endpoint for accepting various consent types
const generalConsentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // Allow more attempts for general consents
  message: {
    error: 'Too many consent acceptance attempts. Please try again later.',
    retryAfter: '60 seconds'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/accept-consent', auth, generalConsentLimiter, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const user = (req as any).user;
    
    if (!user || !user.sub) {
      throw new AppError('User not authenticated', 401);
    }

    const { consent_type, version, registration_id } = req.body;

    logger.debug('Received consent acceptance request:', { userId: user.sub, consent_type, version, registration_id });

    if (!consent_type || typeof consent_type !== 'string') {
      throw new AppError('Invalid consent_type provided', 400);
    }

    const commonConsentData: any = {
      user_id: user.sub,
      consent_type: consent_type,
      consented_at: new Date().toISOString(),
      ...(registration_id && { registration_id: String(registration_id) })
    };

    let data, error;

    switch (consent_type) {
      case 'age_18':
      case 'marketing': { // Add block scope
        // These consents are one-time per user, so we need to manually handle upsert logic due to partial index limitations.
        // The frontend should NOT send registration_id for these.
        if (registration_id) {
          throw new AppError(`Consent type ${consent_type} should not have a registration_id`, 400);
        }
        commonConsentData.version = null; // Explicitly set version to null for one-time consents
        logger.debug(`Attempting SELECT then UPDATE/INSERT for consent_type ${consent_type} with data:`, commonConsentData);
        const { data: existingConsents, error: selectError } = await supabase
          .from('user_consents')
          .select('id')
          .eq('user_id', user.sub)
          .eq('consent_type', consent_type)
          .is('version', null)
          .single();

        if (selectError && selectError.code !== 'PGRST116') { // PGRST116 means no rows found
          throw new AppError(`Failed to check existing consent for ${consent_type}: ${selectError.message}`, 500);
        }

        if (existingConsents) {
          // If record exists, update it
          ({ data, error } = await supabase
            .from('user_consents')
            .update({ ...commonConsentData })
            .eq('id', existingConsents.id));
        } else {
          // If no record exists, insert a new one
          ({ data, error } = await supabase
            .from('user_consents')
            .insert(commonConsentData));
        }
        break;
      } // Close block scope
     
      case 'health_declaration': 
      case 'registration_terms_and_privacy':
        // These consents are per-registration, always create a new record.
        // They MUST have a registration_id and a version.
        if (!registration_id || !version) {
          throw new AppError(`Consent type ${consent_type} requires a registration_id and version`, 400);
        }
        commonConsentData.version = String(version); // Use provided version
        logger.debug(`Attempting insert for consent_type ${consent_type} with data:`, commonConsentData);
        ({ data, error } = await supabase.from('user_consents').insert(commonConsentData));
        break;

      default:
        throw new AppError('Unsupported consent type', 400);
    }

    if (error) { logger.error('Supabase error in /accept-consent:', error); throw new AppError(error.message, 400); }

    logger.info(`User accepted consent type ${consent_type}:`, { userId: user.sub, consent_type, registration_id, version });
    res.json({ 
      success: true, 
      message: `Consent for ${consent_type} accepted successfully`,
      data
    });
  } catch (error) {
    _next(error);
  }
});

// Get all profiles (admin only)
router.get('/admin', admin, async (req: Request, res: Response, _next: NextFunction) => {
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
    _next(error);
  }
});

// Get current user profile (from auth header)
router.get('/me', async (req: Request, res: Response, _next: NextFunction) => {
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
    _next(error);
  }
});

// New endpoint to fetch all user consents
router.get('/consents', auth, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const user = (req as any).user;

    if (!user || !user.sub) {
      throw new AppError('User not authenticated', 401);
    }

    const { data, error } = await supabase
      .from('user_consents')
      .select('*, registration_id, version') // Select all columns relevant for consents
      .eq('user_id', user.sub);

    if (error) throw new AppError(error.message, 500);

    res.setHeader('Cache-Control', 'no-store'); // Add this line to prevent caching
    res.json(data);
  } catch (error) {
    _next(error);
  }
});

// Get user profile
router.get('/:id', async (req: Request, res: Response, _next: NextFunction) => {
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
    _next(error);
  }
});

// Update user profile
router.put('/:id', async (req: Request, res: Response, _next: NextFunction) => {
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
    _next(error);
  }
});

// Update current user profile
router.put('/me', async (req: Request, res: Response, _next: NextFunction) => {
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
    _next(error);
  }
});

// Create user profile
router.post('/', async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert([req.body])
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    res.status(201).json(profile);
  } catch (error) {
    _next(error);
  }
});

export default router; 