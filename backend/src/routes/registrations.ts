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
    console.log('=== REGISTRATION ROUTE STARTED ===');
    logger.info('Registration request received:', req.body);
    logger.info('Validation passed, proceeding with registration creation');
    
    const {
      user_id: bodyUserId, // נוסיף user_id מה-body
      class_id,
      session_id,
      session_class_id,
      first_name,
      last_name,
      phone,
      email,
      selected_date,
      selected_time,
      notes,
      used_credit,
      credit_type,
      purchase_price,
      payment_method, // לא קיים בטבלה - נשתמש רק לוולידציה
      session_selection // לא קיים בטבלה - נשתמש רק לוולידציה
    } = req.body;

    // השתמש ב-user_id מה-body אם קיים, אחרת השתמש ב-req.user?.id
    const user_id = bodyUserId || req.user?.id;

    console.log('Extracted user_id from body:', bodyUserId);
    console.log('Current user ID:', req.user?.id);
    console.log('Final user_id to use:', user_id);

    // הגנה: רק אדמין או המשתמש עצמו יכול ליצור הרשמה
    // אם user_id לא קיים, נאפשר רק לאדמין ליצור הרשמה
    if (user_id && req.user?.id !== user_id) {
      console.log('User is creating registration for different user, checking admin role...');
      // נבדוק אם המשתמש המחובר הוא אדמין
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', req.user?.id)
        .single();
      
      console.log('Profile check result:', { profile, profileError });
      
      if (profileError || !profile || profile.role !== 'admin') {
        logger.error('User is not admin and tries to create registration for another user');
        throw new AppError('אין הרשאה ליצור הרשמה עבור משתמש אחר', 403);
      }
      console.log('User is admin, proceeding...');
    } else if (!user_id) {
      console.log('No user_id provided, checking if current user is admin...');
      // נבדוק אם המשתמש המחובר הוא אדמין
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', req.user?.id)
        .single();
      
      console.log('Profile check result:', { profile, profileError });
      
      if (profileError || !profile || profile.role !== 'admin') {
        logger.error('User is not admin and tries to create registration without user_id');
        throw new AppError('אין הרשאה ליצור הרשמה ללא user_id', 403);
      }
      console.log('User is admin, proceeding...');
    } else {
      console.log('User is creating registration for themselves, proceeding...');
    }

    logger.info('Extracted fields:', {
      user_id,
      class_id,
      session_id,
      session_class_id,
      first_name,
      last_name,
      phone,
      email,
      selected_date,
      selected_time,
      notes,
      used_credit,
      credit_type,
      purchase_price,
      payment_method,
      session_selection
    });

    // Check if class exists and is active
    console.log('Checking if class exists and is active...');
    logger.info('Checking if class exists and is active...');
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('*')
      .eq('id', class_id)
      .eq('is_active', true)
      .single();

    console.log('Class check result:', { classData, classError });

    if (classError || !classData) {
      console.log('Class not found or inactive:', { class_id, classError });
      logger.error('Class not found or inactive:', { class_id, classError });
      throw new AppError('Class not found or inactive', 404);
    }

    console.log('Class found:', classData);
    logger.info('Class found:', classData);

    // Check if user already has an active registration for this class on the same date and time
    // Only check if user_id is provided
    if (user_id) {
      console.log(`Checking for existing registration - user_id: ${user_id}, class_id: ${class_id}, date: ${selected_date}, time: ${selected_time}`);
      logger.info(`Checking for existing registration - user_id: ${user_id}, class_id: ${class_id}, date: ${selected_date}, time: ${selected_time}`);
      
      const { data: existingRegistration, error: checkError } = await supabase
        .from('registrations')
        .select('*')
        .eq('user_id', user_id)
        .eq('class_id', class_id)
        .eq('selected_date', selected_date)
        .eq('selected_time', selected_time)
        .eq('status', 'active')
        .single();

      console.log('Existing registration check result:', { existingRegistration, checkError });

      if (checkError && checkError.code !== 'PGRST116') {
        console.log('Error checking existing registration:', checkError);
        logger.error('Error checking existing registration:', checkError);
        throw new AppError('Failed to check existing registration', 500);
      }

      if (existingRegistration) {
        console.log(`Found existing active registration for same date/time: ${existingRegistration.id} with status: ${existingRegistration.status}`);
        logger.info(`Found existing active registration for same date/time: ${existingRegistration.id} with status: ${existingRegistration.status}`);
        throw new AppError('Already registered for this class on this date and time', 400);
      } else {
        console.log('No existing active registration found for this date and time');
        logger.info('No existing active registration found for this date and time');
      }
    } else {
      console.log('No user_id provided, skipping existing registration check');
      logger.info('No user_id provided, skipping existing registration check');
    }

    // Check if this is a trial class and user has already used it
    if (classData.slug === 'trial-class' && user_id) {
      logger.info(`Trial class registration attempt - user_id: ${user_id}`);
      
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('has_used_trial_class')
        .eq('id', user_id)
        .single();

      if (profileError) {
        logger.error('Error checking trial class status:', profileError);
        throw new AppError('Failed to check trial class status', 500);
      }

      logger.info(`User profile trial class status: has_used_trial_class = ${userProfile?.has_used_trial_class}`);

      if (userProfile?.has_used_trial_class) {
        logger.info(`User ${user_id} already used trial class, registration blocked`);
        throw new AppError('Already used trial class. Cannot register for another trial class.', 400);
      } else {
        logger.info(`User ${user_id} can register for trial class`);
      }
    } else if (classData.slug === 'trial-class' && !user_id) {
      logger.info('Trial class registration attempt without user_id, skipping trial class check');
    }

    // Find or create session_class_id if we have session_id and class_id
    let finalSessionClassId = session_class_id || null;
    
    if (session_id && class_id) {
      logger.info(`Looking for existing session_class for session_id: ${session_id}, class_id: ${class_id}`);
      
      // Try to find existing session_class
      const { data: existingSessionClass, error: sessionClassError } = await supabase
        .from('session_classes')
        .select('id')
        .eq('session_id', session_id)
        .eq('class_id', class_id)
        .eq('is_active', true)
        .single();
      
      if (sessionClassError && sessionClassError.code !== 'PGRST116') {
        logger.error('Error finding session_class:', sessionClassError);
      } else if (existingSessionClass) {
        finalSessionClassId = existingSessionClass.id;
        logger.info(`Found existing session_class_id: ${finalSessionClassId}`);
      } else {
        // Create new session_class if it doesn't exist
        logger.info(`Creating new session_class for session_id: ${session_id}, class_id: ${class_id}`);
        
        const { data: newSessionClass, error: createError } = await supabase
          .from('session_classes')
          .insert({
            session_id: session_id,
            class_id: class_id,
            price: classData.price,
            is_active: true
          })
          .select('id')
          .single();
        
        if (createError) {
          logger.error('Error creating session_class:', createError);
          // Continue without session_class_id if creation fails
        } else {
          finalSessionClassId = newSessionClass.id;
          logger.info(`Created new session_class_id: ${finalSessionClassId}`);
        }
      }
    }

    // בדיקה שיש user_id תקין לפני יצירת ההרשמה
    if (!user_id) {
      console.log('No user_id available, cannot create registration');
      logger.error('No user_id available, cannot create registration');
      throw new AppError('לא ניתן ליצור הרשמה ללא user_id', 400);
    }

    // Create registration - only include fields that exist in the database
    const registrationData = {
      class_id: class_id || null, // Convert empty string to null
      session_id: session_id || null, // Convert empty string to null
      session_class_id: finalSessionClassId, // Use the found or created session_class_id
      user_id: user_id, // עכשיו זה תמיד יהיה תקין
      first_name: first_name || null, // Convert empty string to null
      last_name: last_name || null, // Convert empty string to null
      phone: phone || null, // Convert empty string to null
      email: email || null, // Convert empty string to null
      selected_date: selected_date || null, // Convert empty string to null
      selected_time: selected_time || null, // Convert empty string to null
      notes: notes || null, // Convert empty string to null
      used_credit: used_credit === true, // Ensure boolean
      credit_type: credit_type || null, // Convert empty string to null
      purchase_price: purchase_price || null, // Convert empty string to null
      status: 'active' // Default status for new registrations
      // Note: payment_method and session_selection are not stored in the database
      // They are only used for validation and frontend logic
    };

    console.log('Attempting to create registration with data:', registrationData);
    logger.info('Attempting to create registration with data:', registrationData);

    const { data, error } = await supabase
      .from('registrations')
      .insert([registrationData])
      .select(`
        *,
        class:classes(id, name, price, duration, level, category)
      `)
      .single();

    console.log('Insert result:', { data, error });

    if (error) {
      console.log('Failed to create registration:', error);
      logger.error('Failed to create registration:', error);
      throw new AppError(`Failed to create registration: ${error.message}`, 500);
    }

    console.log('Registration created successfully:', data);
    logger.info('Registration created successfully:', data);

    // If this is a trial class, update the user's profile
    if (classData.slug === 'trial-class') {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ has_used_trial_class: true })
        .eq('id', user_id);

      if (updateError) {
        logger.error('Failed to update trial class status:', updateError);
        // Don't fail the registration, just log the error
      }
    }

    // If registration uses credits, deduct one credit from user's subscription
    if (used_credit && credit_type) {
      logger.info(`Registration uses credits - user_id: ${user_id}, credit_type: ${credit_type}`);
      
      try {
        // Get current credits for the user
        const { data: currentCredits, error: creditsError } = await supabase
          .from('subscription_credits')
          .select('*')
          .eq('user_id', user_id)
          .eq('credit_group', credit_type)
          .gt('remaining_credits', 0)
          .order('created_at', { ascending: true }) // Use oldest credits first
          .limit(1)
          .single();

        if (creditsError && creditsError.code !== 'PGRST116') {
          logger.error('Error fetching current credits:', creditsError);
          throw new AppError('Failed to check current credits', 500);
        }

        if (currentCredits && currentCredits.remaining_credits > 0) {
          // Update existing credits
          const { error: updateError } = await supabase
            .from('subscription_credits')
            .update({ 
              remaining_credits: currentCredits.remaining_credits - 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', currentCredits.id);

          if (updateError) {
            logger.error('Failed to update credits:', updateError);
            throw new AppError('Failed to update credits', 500);
          }

          logger.info(`Credit deducted successfully for user ${user_id}, remaining: ${currentCredits.remaining_credits - 1}`);
        } else {
          logger.warn(`No credits available for user ${user_id}, credit_type: ${credit_type}`);
          // Don't fail the registration, just log the warning
          // This allows registration to proceed even without credits
        }
      } catch (error) {
        logger.error('Error handling credits:', error);
        // Don't fail the registration, just log the error
        // This ensures registration can still succeed even if credit handling fails
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

    // If this is a subscription class being cancelled and was paid with credit, return the credit
    if (registrationData.used_credit && registrationData.credit_type && status === 'cancelled') {
      logger.info(`Subscription class cancellation with credit detected for user ${registrationData.user_id}, credit_type: ${registrationData.credit_type}`);
      
      try {
        // Check if user already has credits for this group
        const { data: existingCredits, error: checkError } = await supabase
          .from('subscription_credits')
          .select('*')
          .eq('user_id', registrationData.user_id)
          .eq('credit_group', registrationData.credit_type)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          logger.error('Error checking existing credits:', checkError);
        }

        if (existingCredits) {
          // Update existing credits
          const { error: updateError } = await supabase
            .from('subscription_credits')
            .update({ 
              remaining_credits: existingCredits.remaining_credits + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingCredits.id);

          if (updateError) {
            logger.error('Failed to update existing credits:', updateError);
          } else {
            logger.info(`Credit returned successfully to existing record for user ${registrationData.user_id}, credit_type: ${registrationData.credit_type}`);
          }
        } else {
          // Create new credit record
          const { data: creditData, error: creditError } = await supabase
            .from('subscription_credits')
            .insert([{
              user_id: registrationData.user_id,
              credit_group: registrationData.credit_type,
              remaining_credits: 1,
              expires_at: null
            }])
            .select()
            .single();

          if (creditError) {
            logger.error('Failed to create new credit record:', creditError);
          } else {
            logger.info(`New credit record created successfully for user ${registrationData.user_id}, credit_type: ${registrationData.credit_type}`);
          }
        }
      } catch (error) {
        logger.error('Error returning credit on status update:', error);
        // Don't fail the status update, just log the error
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

    // If this is a subscription class being cancelled and was paid with credit, return the credit
    if (registrationData.used_credit && registrationData.credit_type) {
      logger.info(`Subscription class cancellation with credit detected for user ${registrationData.user_id}, credit_type: ${registrationData.credit_type}`);
      
      try {
        // Check if user already has credits for this group
        const { data: existingCredits, error: checkError } = await supabase
          .from('subscription_credits')
          .select('*')
          .eq('user_id', registrationData.user_id)
          .eq('credit_group', registrationData.credit_type)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          logger.error('Error checking existing credits:', checkError);
        }

        if (existingCredits) {
          // Update existing credits
          const { error: updateError } = await supabase
            .from('subscription_credits')
            .update({ 
              remaining_credits: existingCredits.remaining_credits + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingCredits.id);

          if (updateError) {
            logger.error('Failed to update existing credits:', updateError);
          } else {
            logger.info(`Credit returned successfully to existing record for user ${registrationData.user_id}, credit_type: ${registrationData.credit_type}`);
          }
        } else {
          // Create new credit record
          const { data: creditData, error: creditError } = await supabase
            .from('subscription_credits')
            .insert([{
              user_id: registrationData.user_id,
              credit_group: registrationData.credit_type,
              remaining_credits: 1,
              expires_at: null
            }])
            .select()
            .single();

          if (creditError) {
            logger.error('Failed to create new credit record:', creditError);
          } else {
            logger.info(`New credit record created successfully for user ${registrationData.user_id}, credit_type: ${registrationData.credit_type}`);
          }
        }
      } catch (error) {
        logger.error('Error returning credit on cancellation:', error);
        // Don't fail the cancellation, just log the error
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