import { Router, Request, Response, NextFunction } from 'express';
import { supabase } from '../database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { validateRegistration } from '../middleware/validation';
import { auth } from '../middleware/auth';
import { RegistrationWithDetails } from '../types/models';

const router = Router();

// Get all registrations with class and user details (admin only)
router.get('/', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info('Admin registrations endpoint called by user:', req.user?.id);
    
    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user!.id)
      .single();

    if (profileError || !profile) {
      logger.error('User profile not found:', req.user?.id);
      throw new AppError('User profile not found', 404);
    }

    if (profile.role !== 'admin') {
      logger.error('Access denied for user:', req.user?.id, 'role:', profile.role);
      throw new AppError('Access denied. Admin only.', 403);
    }

    logger.info('User is admin, fetching registrations...');

    // Get all registrations with class and user details
    const { data, error } = await supabase
      .from('registrations')
      .select(`
        *,
        class:classes(id, name, price, duration, level, category),
        user:profiles(id, first_name, last_name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching registrations:', error);
      throw new AppError('Failed to fetch registrations', 500);
    }

    logger.info('Registrations fetched successfully:', { count: data?.length || 0 });
    res.json(data || []);
  } catch (error) {
    next(error);
  }
});

// Get user's own registrations
router.get('/my', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select(`
        *,
        class:classes(id, name, price, duration, level, category)
      `)
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch registrations', 500);
    }

    res.json(data || []);
  } catch (error) {
    next(error);
  }
});

// Get registration by ID
router.get('/:id', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Check if user is admin or owns the registration
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user!.id)
      .single();

    if (profileError || !profile) {
      throw new AppError('User profile not found', 404);
    }

    let query = supabase
      .from('registrations')
      .select(`
        *,
        class:classes(id, name, price, duration, level, category),
        user:profiles(id, first_name, last_name, email)
      `)
      .eq('id', id);

    // If not admin, only show own registrations
    if (profile.role !== 'admin') {
      query = query.eq('user_id', req.user!.id);
    }

    const { data, error } = await query.single();

    if (error) {
      throw new AppError('Failed to fetch registration', 500);
    }

    if (!data) {
      throw new AppError('Registration not found', 404);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Create new registration
router.post('/', auth, validateRegistration, async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info('Registration request received:', req.body);
    
    const {
      class_id,
      session_id,
      session_class_id,
      first_name,
      last_name,
      phone,
      email,
      experience,
      selected_date,
      selected_time,
      notes,
      payment_id
    } = req.body;

    // Check if class exists and is active
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('*')
      .eq('id', class_id)
      .eq('is_active', true)
      .single();

    if (classError || !classData) {
      throw new AppError('Class not found or inactive', 404);
    }

    // Check if user already has an active registration for this class on the same date and time
    logger.info(`Checking for existing registration - user_id: ${req.user!.id}, class_id: ${class_id}, date: ${selected_date}, time: ${selected_time}`);
    
    const { data: existingRegistration, error: checkError } = await supabase
      .from('registrations')
      .select('*')
      .eq('user_id', req.user!.id)
      .eq('class_id', class_id)
      .eq('selected_date', selected_date)
      .eq('selected_time', selected_time)
      .eq('status', 'active')
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      logger.error('Error checking existing registration:', checkError);
      throw new AppError('Failed to check existing registration', 500);
    }

    if (existingRegistration) {
      logger.info(`Found existing active registration for same date/time: ${existingRegistration.id} with status: ${existingRegistration.status}`);
      throw new AppError('Already registered for this class on this date and time', 400);
    } else {
      logger.info('No existing active registration found for this date and time');
    }

    // Check if this is a trial class and user has already used it
    if (classData.slug === 'trial-class') {
      logger.info(`Trial class registration attempt - user_id: ${req.user!.id}`);
      
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('has_used_trial_class')
        .eq('id', req.user!.id)
        .single();

      if (profileError) {
        logger.error('Error checking trial class status:', profileError);
        throw new AppError('Failed to check trial class status', 500);
      }

      logger.info(`User profile trial class status: has_used_trial_class = ${userProfile?.has_used_trial_class}`);

      if (userProfile?.has_used_trial_class) {
        logger.info(`User ${req.user!.id} already used trial class, registration blocked`);
        throw new AppError('Already used trial class. Cannot register for another trial class.', 400);
      } else {
        logger.info(`User ${req.user!.id} can register for trial class`);
      }
    }

    // Create registration
    const { data, error } = await supabase
      .from('registrations')
      .insert([{
        class_id,
        session_id,
        session_class_id,
        user_id: req.user!.id,
        first_name,
        last_name,
        phone,
        email,
        experience,
        selected_date,
        selected_time,
        notes,
        payment_id,
        status: 'active'
      }])
      .select(`
        *,
        class:classes(id, name, price, duration, level, category)
      `)
      .single();

    if (error) {
      throw new AppError('Failed to create registration', 500);
    }

    // If this is a trial class, update the user's profile
    if (classData.slug === 'trial-class') {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ has_used_trial_class: true })
        .eq('id', req.user!.id);

      if (updateError) {
        logger.error('Failed to update trial class status:', updateError);
        // Don't fail the registration, just log the error
      }
    }

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

// Update registration status (admin only)
router.put('/:id/status', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user!.id)
      .single();

    if (profileError || !profile) {
      throw new AppError('User profile not found', 404);
    }

    if (profile.role !== 'admin') {
      throw new AppError('Access denied. Admin only.', 403);
    }

    // Validate status
    const validStatuses = ['active', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid status. Must be one of: active, cancelled', 400);
    }

    // Get the registration with class details to check if it's a trial class
    const { data: registrationData, error: regError } = await supabase
      .from('registrations')
      .select(`
        *,
        class:classes(id, name, slug, price, duration, level, category)
      `)
      .eq('id', id)
      .single();

    if (regError || !registrationData) {
      throw new AppError('Registration not found', 404);
    }

    // Update registration status
    const { data, error } = await supabase
      .from('registrations')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        class:classes(id, name, price, duration, level, category),
        user:profiles(id, first_name, last_name, email)
      `)
      .single();

    if (error) {
      throw new AppError('Failed to update registration', 500);
    }

    if (!data) {
      throw new AppError('Registration not found', 404);
    }

    // If this is a trial class being cancelled, update the user's profile
    if (registrationData.class.slug === 'trial-class' && status === 'cancelled') {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ has_used_trial_class: false })
        .eq('id', registrationData.user_id);

      if (updateError) {
        logger.error('Failed to update trial class status in profile:', updateError);
        // Don't fail the status update, just log the error
      } else {
        logger.info(`Trial class cancelled for user ${registrationData.user_id}, has_used_trial_class set to false`);
      }
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Cancel registration (user can cancel own, admin can cancel any)
router.put('/:id/cancel', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if user is admin or owns the registration
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user!.id)
      .single();

    if (profileError || !profile) {
      throw new AppError('User profile not found', 404);
    }

    // Get the registration with class details
    let query = supabase
      .from('registrations')
      .select(`
        *,
        class:classes(id, name, slug, price, duration, level, category)
      `)
      .eq('id', id);

    // If not admin, only allow cancellation of own registrations
    if (profile.role !== 'admin') {
      query = query.eq('user_id', req.user!.id);
    }

    const { data: registrationData, error: regError } = await query.single();

    if (regError || !registrationData) {
      throw new AppError('Registration not found', 404);
    }

    // Check if registration is already cancelled
    if (registrationData.status === 'cancelled') {
      throw new AppError('Registration is already cancelled', 400);
    }

    // Check if it's too late to cancel (48 hours before class)
    const classDate = new Date(registrationData.selected_date);
    const [hour, minute] = registrationData.selected_time.split(':');
    classDate.setHours(Number(hour), Number(minute), 0, 0);
    const now = new Date();
    const diffMs = classDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 48) {
      throw new AppError('Cannot cancel registration less than 48 hours before class', 400);
    }

    // Update registration status to cancelled
    const { data, error } = await supabase
      .from('registrations')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select(`
        *,
        class:classes(id, name, price, duration, level, category),
        user:profiles(id, first_name, last_name, email)
      `)
      .single();

    if (error) {
      throw new AppError('Failed to cancel registration', 500);
    }

    // If this is a trial class being cancelled, update the user's profile
    if (registrationData.class.slug === 'trial-class') {
      logger.info(`Trial class cancellation detected for user ${registrationData.user_id}`);
      
      const { data: profileBefore, error: profileCheckError } = await supabase
        .from('profiles')
        .select('has_used_trial_class')
        .eq('id', registrationData.user_id)
        .single();
      
      if (profileCheckError) {
        logger.error('Failed to check profile before update:', profileCheckError);
      } else {
        logger.info(`Profile before update - has_used_trial_class: ${profileBefore?.has_used_trial_class}`);
      }
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ has_used_trial_class: false })
        .eq('id', registrationData.user_id);

      if (updateError) {
        logger.error('Failed to update trial class status in profile:', updateError);
        // Don't fail the cancellation, just log the error
      } else {
        logger.info(`Trial class cancelled for user ${registrationData.user_id}, has_used_trial_class set to false`);
        
        // Verify the update
        const { data: profileAfter, error: profileAfterError } = await supabase
          .from('profiles')
          .select('has_used_trial_class')
          .eq('id', registrationData.user_id)
          .single();
        
        if (profileAfterError) {
          logger.error('Failed to verify profile update:', profileAfterError);
        } else {
          logger.info(`Profile after update - has_used_trial_class: ${profileAfter?.has_used_trial_class}`);
        }
      }
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Delete registration (user can delete own, admin can delete any)
router.delete('/:id', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if user is admin or owns the registration
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user!.id)
      .single();

    if (profileError || !profile) {
      throw new AppError('User profile not found', 404);
    }

    let query = supabase
      .from('registrations')
      .delete()
      .eq('id', id);

    // If not admin, only allow deletion of own registrations
    if (profile.role !== 'admin') {
      query = query.eq('user_id', req.user!.id);
    }

    const { error } = await query;

    if (error) {
      throw new AppError('Failed to delete registration', 500);
    }

    res.json({ message: 'Registration deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router; 