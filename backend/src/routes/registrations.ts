import { Router, Request, Response, NextFunction } from 'express';
import { supabase } from '../database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { validateRegistration } from '../middleware/validation';
import { auth } from '../middleware/auth';
import { RegistrationWithDetails } from '../types/models';
import { 
  deductCredit, 
  addCredit, 
  getUserCredits, 
  checkUserCredits, 
  addCreditsToUser, 
  updateUserCredits, 
  deleteUserCredits, 
  getCreditStatistics, 
  getUserCreditHistory 
} from '../utils/creditManager';
import { 
  validateClassRegistration, 
  getClassCreditInfo,
  getAvailableCreditTypes 
} from '../utils/classCreditValidator';


const router = Router();

// Get user's subscription credits
router.get('/user/:userId/credits', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    
    // Check if user is admin or requesting own credits
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user!.sub)
      .single();

    if (profileError || !profile) {
      throw new AppError('User profile not found', 404);
    }

    // Only admin can check other users' credits, or user can check their own
    if (profile.role !== 'admin' && req.user!.sub !== userId) {
      throw new AppError('Access denied. Admin only or own credits.', 403);
    }

    const credits = await getUserCredits(userId);
    res.json(credits);
  } catch (error) {
    next(error);
  }
});

// Check if user has enough credits for a specific type
router.get('/user/:userId/credits/check/:creditType', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, creditType } = req.params;
    
    // Check if user is admin or requesting own credits
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user!.sub)
      .single();

    if (profileError || !profile) {
      throw new AppError('User profile not found', 404);
    }

    // Only admin can check other users' credits, or user can check their own
    if (profile.role !== 'admin' && req.user!.sub !== userId) {
      throw new AppError('Access denied. Admin only or own credits.', 403);
    }

    const creditInfo = await checkUserCredits(userId, creditType);
    res.json(creditInfo);
  } catch (error) {
    next(error);
  }
});

// Add credits to user (admin only)
router.post('/user/:userId/credits', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { credit_group, remaining_credits, expires_at } = req.body;
    
    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user!.sub)
      .single();

    if (profileError || !profile) {
      throw new AppError('User profile not found', 404);
    }

    if (profile.role !== 'admin') {
      throw new AppError('Access denied. Admin only.', 403);
    }

    // Validate required fields
    if (!credit_group || !remaining_credits) {
      throw new AppError('credit_group and remaining_credits are required', 400);
    }

    const creditData = await addCreditsToUser(userId, credit_group, remaining_credits, expires_at);
    res.json(creditData);
  } catch (error) {
    next(error);
  }
});

// Update user credits (admin only)
router.put('/user/:userId/credits/:creditId', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, creditId } = req.params;
    const { remaining_credits, expires_at } = req.body;
    
    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user!.sub)
      .single();

    if (profileError || !profile) {
      throw new AppError('User profile not found', 404);
    }

    if (profile.role !== 'admin') {
      throw new AppError('Access denied. Admin only.', 403);
    }

    // Validate required fields
    if (remaining_credits === undefined) {
      throw new AppError('remaining_credits is required', 400);
    }

    const creditData = await updateUserCredits(userId, creditId, remaining_credits, expires_at);
    res.json(creditData);
  } catch (error) {
    next(error);
  }
});

// Delete user credits (admin only)
router.delete('/user/:userId/credits/:creditId', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, creditId } = req.params;
    
    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user!.sub)
      .single();

    if (profileError || !profile) {
      throw new AppError('User profile not found', 404);
    }

    if (profile.role !== 'admin') {
      throw new AppError('Access denied. Admin only.', 403);
    }

    await deleteUserCredits(userId, creditId);
    res.json({ message: 'Credits deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get credit statistics (admin only)
router.get('/credits/statistics', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user!.sub)
      .single();

    if (profileError || !profile) {
      throw new AppError('User profile not found', 404);
    }

    if (profile.role !== 'admin') {
      throw new AppError('Access denied. Admin only.', 403);
    }

    const statistics = await getCreditStatistics();
    res.json(statistics);
  } catch (error) {
    next(error);
  }
});

// Get credit history for a user (admin only)
router.get('/user/:userId/credits/history', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    
    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user!.sub)
      .single();

    if (profileError || !profile) {
      throw new AppError('User profile not found', 404);
    }

    if (profile.role !== 'admin') {
      throw new AppError('Access denied. Admin only.', 403);
    }

    const history = await getUserCreditHistory(userId);
    res.json(history);
  } catch (error) {
    next(error);
  }
});

// Get available credit types for a class
router.get('/class/:classId/credit-types', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { classId } = req.params;
    
    // Get class credit information
    const classInfo = await getClassCreditInfo(classId);
    
    // Get available credit types
    const availableTypes = getAvailableCreditTypes(classInfo);
    
    res.json({
      class_id: classId,
      class_type: classInfo.class_type,
      category: classInfo.category,
      available_credit_types: availableTypes
    });
  } catch (error) {
    next(error);
  }
});



// Get all registrations with class and user details (admin only)
router.get('/', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info('Admin registrations endpoint called by user:', req.user?.sub);
    
    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user!.sub)
      .single();

    if (profileError || !profile) {
      logger.error('User profile not found:', req.user?.sub);
      throw new AppError('User profile not found', 404);
    }

    if (profile.role !== 'admin') {
              logger.error('Access denied for user:', req.user?.sub, 'role:', profile.role);
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
      .eq('user_id', req.user!.sub)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch registrations', 500);
    }

    res.json(data || []);
  } catch (error) {
    next(error);
  }
});

// Get user registrations by user_id and class_id (admin only)
router.get('/user/:userId', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { class_id } = req.query;
    
    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user!.sub)
      .single();

    if (profileError || !profile) {
      throw new AppError('User profile not found', 404);
    }

    if (profile.role !== 'admin') {
      throw new AppError('Access denied. Admin only.', 403);
    }

    let query = supabase
      .from('registrations')
      .select(`
        *,
        class:classes(id, name, price, duration, level, category)
      `)
      .eq('user_id', userId)
      .eq('status', 'active');

    // Add class_id filter if provided
    if (class_id) {
      query = query.eq('class_id', class_id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch user registrations', 500);
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
      .eq('id', req.user!.sub)
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
      query = query.eq('user_id', req.user!.sub);
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
      session_selection, // לא קיים בטבלה - נשתמש רק לוולידציה
      registration_terms_accepted, // New field for general terms
      health_declaration_accepted, // New field for health declaration
      age_confirmation_accepted // New field for age confirmation
    } = req.body;

    logger.info('Raw request body:', req.body);
    logger.info('Extracted credit fields:', { used_credit, credit_type, user_id: bodyUserId });

    // השתמש ב-user_id מה-body אם קיים, אחרת השתמש ב-req.user?.sub
    const user_id = bodyUserId || req.user?.sub;

    console.log('Extracted user_id from body:', bodyUserId);
    console.log('Current user ID:', req.user?.sub);
    console.log('Final user_id to use:', user_id);

    // הגנה: רק אדמין או המשתמש עצמו יכול ליצור הרשמה
    // אם user_id לא קיים, נאפשר רק לאדמין ליצור הרשמה
    if (user_id && req.user?.sub !== user_id) {
      console.log('User is creating registration for different user, checking admin role...');
      // נבדוק אם המשתמש המחובר הוא אדמין
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', req.user?.sub)
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
        .eq('id', req.user?.sub)
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
      session_selection,
      registration_terms_accepted,
      health_declaration_accepted,
      age_confirmation_accepted
    });
    
    logger.info('Credit fields check:', {
      used_credit: typeof used_credit,
      credit_type: typeof credit_type,
      user_id: typeof user_id,
      used_credit_value: used_credit,
      credit_type_value: credit_type,
      user_id_value: user_id
    });

    // Validate terms acceptance
    if (registration_terms_accepted !== true) {
      logger.error('Registration terms not accepted');
      throw new AppError('עליך לאשר את תנאי השימוש ומדיניות הפרטיות כדי להמשיך בהרשמה.', 400);
    }
    if (health_declaration_accepted !== true) {
      logger.error('Health declaration terms not accepted');
      throw new AppError('עליך לאשר את הצהרת הבריאות כדי להמשיך בהרשמה.', 400);
    }
    if (age_confirmation_accepted !== true) {
      logger.error('Age confirmation not accepted');
      throw new AppError('עליך לאשר את תנאי הגיל כדי להמשיך בהרשמה.', 400);
    }

    // Check if class exists and get credit information
    console.log('Checking if class exists and getting credit information...');
    logger.info('Checking if class exists and getting credit information...');
    
    let classData: any;
    try {
      const classResult = await supabase
        .from('classes')
        .select('*')
        .eq('id', class_id)
        .eq('is_active', true)
        .single();
      
      if (classResult.error || !classResult.data) {
        console.log('Class not found or inactive:', { class_id, error: classResult.error });
        logger.error('Class not found or inactive:', { class_id, error: classResult.error });
        throw new AppError('Class not found or inactive', 404);
      }
      
      classData = classResult.data;
      console.log('Class found:', classData);
      logger.info('Class found:', classData);
    } catch (error) {
      console.log('Error fetching class:', error);
      logger.error('Error fetching class:', error);
      throw new AppError('Failed to fetch class information', 500);
    }

    // Check if user already has an active registration for this class on the same date and time
    // Only check if user_id is provided
    if (user_id) {
      console.log(`Checking for existing registration - user_id: ${user_id}, class_id: ${class_id}, date: ${selected_date}, time: ${selected_time}`);
      logger.info(`Checking for existing registration - user_id: ${user_id}, class_id: ${class_id}, date: ${selected_date}, time: ${selected_time}`);
      
      // Normalize time format for comparison (remove "עד" part if exists)
      const normalizedTime = selected_time.split(' עד ')[0].trim();
      
      // Check for existing registrations with both time formats
      const { data: existingRegistrations, error: checkError } = await supabase
        .from('registrations')
        .select('*')
        .eq('user_id', user_id)
        .eq('class_id', class_id)
        .eq('selected_date', selected_date)
        .eq('status', 'active');

      if (checkError) {
        console.log('Error checking existing registration:', checkError);
        logger.error('Error checking existing registration:', checkError);
        throw new AppError('Failed to check existing registration', 500);
      }

      // Check if any existing registration matches the time (with or without "עד")
      const existingRegistration = existingRegistrations?.find(reg => {
        const regTime = reg.selected_time?.split(' עד ')[0]?.trim() || reg.selected_time;
        const inputTime = selected_time?.split(' עד ')[0]?.trim() || selected_time;
        return regTime === inputTime || regTime === selected_time || regTime === normalizedTime;
      });

      console.log('Existing registration check result:', { existingRegistration, checkError: checkError || null });

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

    // Check if this is a trial class and user has already used THIS trial (per class)
    if (user_id && (classData.category || '').toLowerCase() === 'trial') {
      logger.info(`Trial class (per-class) registration attempt - user_id: ${user_id}, class_id: ${class_id}`);

      const { data: usedRecord, error: usedError } = await supabase
        .from('user_trial_classes')
        .select('id')
        .eq('user_id', user_id)
        .eq('class_id', class_id)
        .maybeSingle();

      if (usedError) {
        logger.error('Error checking per-class trial usage:', usedError);
        throw new AppError('Failed to check trial usage status', 500);
      }

      if (usedRecord) {
        logger.info(`User ${user_id} already used trial for class ${class_id}, registration blocked`);
        throw new AppError('כבר השתמשת בשיעור הניסיון הזה. לא ניתן להירשם אליו שוב.', 400);
      } else {
        logger.info(`User ${user_id} can register for this trial class`);
      }
    }

    // Validate credit usage with new logic
    if (used_credit || credit_type) {
      console.log('Validating credit usage with new logic...');
      logger.info('Validating credit usage with new logic...');
      
      try {
        // If it's a subscription class and this request includes a purchase_price > 0,
        // allow registration even if the user currently has 0 credits (credits will be added below).
        const shouldCheckBalance = !(
          classData.category === 'subscription' &&
          typeof purchase_price === 'number' &&
          purchase_price > 0
        );

        const creditValidation = await validateClassRegistration(
          class_id,
          used_credit || false,
          credit_type,
          shouldCheckBalance ? user_id : undefined
        );
        
        if (!creditValidation.isValid) {
          // If we're in purchase flow and the only failure is lack of balance, allow
          if (
            !shouldCheckBalance &&
            creditValidation.errorMessage &&
            creditValidation.errorMessage.includes('אין מספיק קרדיטים')
          ) {
            console.log('Proceeding despite low balance due to purchase flow');
          } else {
            console.log('Credit validation failed:', creditValidation.errorMessage);
            logger.error('Credit validation failed:', creditValidation.errorMessage);
            throw new AppError(creditValidation.errorMessage || 'Credit validation failed', 400);
          }
        }
        
        console.log('Credit validation passed:', creditValidation);
        logger.info('Credit validation passed:', creditValidation);
      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }
        console.log('Error during credit validation:', error);
        logger.error('Error during credit validation:', error);
        throw new AppError('Failed to validate credit usage', 500);
      }
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

    // Check availability before creating registration
    if (session_id && selected_date && selected_time) {
      console.log(`Checking availability before registration - session_id: ${session_id}, date: ${selected_date}, time: ${selected_time}`);
      logger.info(`Checking availability before registration - session_id: ${session_id}, date: ${selected_date}, time: ${selected_time}`);
      
      // Get the session to check max capacity
      const { data: session, error: sessionError } = await supabase
        .from('schedule_sessions')
        .select('max_capacity')
        .eq('id', session_id)
        .single();

      if (sessionError || !session) {
        console.log('Error fetching session for availability check:', sessionError);
        logger.error('Error fetching session for availability check:', sessionError);
        throw new AppError('Session not found for availability check', 404);
      }

      // Count existing registrations for this session, date, and time
      const { count, error: countError } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', session_id)
        .eq('selected_date', selected_date)
        .eq('selected_time', selected_time)
        .eq('status', 'active');

      if (countError) {
        console.log('Error counting registrations for availability check:', countError);
        logger.error('Error counting registrations for availability check:', countError);
        throw new AppError('Failed to check availability', 500);
      }

      const takenSpots = count || 0;
      const availableSpots = session.max_capacity - takenSpots;
      
      console.log(`Availability check result: ${takenSpots}/${session.max_capacity} taken, ${availableSpots} available`);
      logger.info(`Availability check result: ${takenSpots}/${session.max_capacity} taken, ${availableSpots} available`);

      if (availableSpots <= 0) {
        console.log('No available spots for this session');
        logger.warn('Registration attempt for full session:', { session_id, selected_date, selected_time, takenSpots, maxCapacity: session.max_capacity });
        throw new AppError('אין מקום פנוי בקבוצה זו. הקבוצה מלאה.', 400);
      }
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
      status: 'active', // Default status for new registrations
      registration_terms_accepted: registration_terms_accepted, // Use value from frontend
      health_declaration_accepted: health_declaration_accepted, // New field
      age_confirmation_accepted: age_confirmation_accepted // New field
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

    // If this is a trial class, record per-class usage (idempotent by unique constraint)
    if ((classData.category || '').toLowerCase() === 'trial') {
      const { error: insertUsageError } = await supabase
        .from('user_trial_classes')
        .insert({ user_id, class_id })
        .select('id')
        .single();

      if (insertUsageError && insertUsageError.code !== '23505') { // ignore unique violation
        logger.error('Failed to record trial usage:', insertUsageError);
        // Don't fail the registration, just log the error
      }
    }

    // If registration uses credits, deduct one credit from user's subscription
    logger.info(`Credit check - used_credit: ${used_credit}, credit_type: ${credit_type}, user_id: ${user_id}`);
    logger.info(`Credit check types - used_credit: ${typeof used_credit}, credit_type: ${typeof credit_type}, user_id: ${typeof user_id}`);
    logger.info(`Credit check truthy - used_credit: ${!!used_credit}, credit_type: ${!!credit_type}, user_id: ${!!user_id}`);
    
    if (used_credit && credit_type) {
      logger.info(`Registration uses credits - user_id: ${user_id}, credit_type: ${credit_type}`);

      // Ensure user actually has credits before deduction
      const userCredits = await getUserCredits(user_id);
      const userHasCredits = userCredits.some((credit: any) =>
        credit.credit_group === credit_type && credit.remaining_credits > 0
      );
      if (!userHasCredits) {
        logger.warn(`User ${user_id} has no available ${credit_type} credits. Cancelling registration.`);
        // Cancel the just-created registration to keep data consistent
        await supabase.from('registrations').update({ status: 'cancelled' }).eq('id', data.id);
        throw new AppError('אין מספיק קרדיטים זמינים לשימוש', 400);
      }

      // Deduct one credit
      const creditDeducted = await deductCredit(user_id, credit_type);
      if (!creditDeducted) {
        logger.warn(`Failed to deduct credit for user ${user_id}, credit_type: ${credit_type}. Cancelling registration.`);
        await supabase.from('registrations').update({ status: 'cancelled' }).eq('id', data.id);
        throw new AppError('נכשלה הורדת הקרדיט. ההרשמה בוטלה אוטומטית.', 400);
      }
      logger.info(`Credit deducted successfully for user ${user_id}, credit_type: ${credit_type}`);
    } else {
      logger.info(`No credits used - used_credit: ${used_credit}, credit_type: ${credit_type}`);
      // Purchase flow: add credits for subscription/private class and deduct one for this registration
      try {
        const isSubscriptionClass = classData.category === 'subscription';
        const isPrivateClass = classData.category === 'private';
        const isPurchase = typeof purchase_price === 'number' && purchase_price > 0;

        if (isPurchase && (isSubscriptionClass || isPrivateClass)) {
          // Determine credit group and amount by class configuration
          let purchaseCreditGroup: 'group' | 'private' | null = null;
          let creditsToAdd = 0;

          if (isSubscriptionClass) {
            // subscription → group credits
            purchaseCreditGroup = 'group';
            creditsToAdd = Number(classData.group_credits) || 0;
          } else if (isPrivateClass) {
            // private → private credits
            purchaseCreditGroup = 'private';
            creditsToAdd = Number(classData.private_credits) || 0;
          }

          if (purchaseCreditGroup && creditsToAdd > 0) {
            logger.info(`Purchase flow detected. Adding ${creditsToAdd} ${purchaseCreditGroup} credits to user ${user_id}`);
            const creditRecord = await addCreditsToUser(user_id, purchaseCreditGroup, creditsToAdd);
            // Deduct one credit to account for the current registration
            const deducted = await deductCredit(user_id, purchaseCreditGroup);
            if (!deducted) {
              logger.warn(`Failed to deduct 1 ${purchaseCreditGroup} credit after purchase for user ${user_id}. Rolling back addition and cancelling registration.`);
              // Attempt rollback of the +1 by updating the same record
              if (creditRecord && creditRecord.id != null && typeof creditRecord.remaining_credits === 'number') {
                try {
                  await updateUserCredits(user_id, creditRecord.id, Math.max(0, creditRecord.remaining_credits - 1), creditRecord.expires_at);
                } catch (rbErr) {
                  logger.error('Rollback of credit addition failed:', rbErr);
                }
              }
              await supabase.from('registrations').update({ status: 'cancelled' }).eq('id', data.id);
              throw new AppError('שגיאה בעדכון קרדיטים לאחר רכישה. ההרשמה בוטלה, נסי שוב.', 500);
            } else {
              logger.info(`Deducted 1 ${purchaseCreditGroup} credit after purchase for user ${user_id}`);
            }
          } else {
            logger.info('Purchase flow: No credits defined to add for this class configuration');
          }
        }
      } catch (creditPurchaseError) {
        logger.error('Error handling purchase-flow credits:', creditPurchaseError);
        // Do not fail the registration
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
    const { status, returnCredit, deductCredit: deductCreditOption } = req.body; // Admin choices

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user!.sub)
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

    // Before updating: if activating, ensure no duplicate active registration exists for same user/class/date/time
    if (status === 'active') {
      const { data: dupList, error: dupError } = await supabase
        .from('registrations')
        .select('id')
        .eq('user_id', registrationData.user_id)
        .eq('class_id', registrationData.class_id)
        .eq('selected_date', registrationData.selected_date)
        .eq('selected_time', registrationData.selected_time)
        .eq('status', 'active');

      if (dupError) {
        throw new AppError('Failed to check existing registrations', 500);
      }

      const hasOtherActive = (dupList || []).some(r => r.id !== id);
      if (hasOtherActive) {
        throw new AppError('כבר קיימת הרשמה פעילה למשתמש זה לשיעור זה בתאריך ובשעה אלו', 400);
      }
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

    // If this is a trial class being cancelled, remove per-class usage record to allow re-register
    if ((registrationData.class.category || '').toLowerCase() === 'trial' && status === 'cancelled') {
      const { error: deleteUsageError } = await supabase
        .from('user_trial_classes')
        .delete()
        .eq('user_id', registrationData.user_id)
        .eq('class_id', registrationData.class_id);

      if (deleteUsageError) {
        logger.error('Failed to delete trial usage record on cancel:', deleteUsageError);
        // Don't fail the status update, just log the error
      } else {
        logger.info(`Trial usage record removed for user ${registrationData.user_id} and class ${registrationData.class_id}`);
      }
    }

    // If this registration consumed a credit (either used_credit=true or purchase flow), return it on cancel
    if (status === 'cancelled') {
      let creditGroupToReturn: 'group' | 'private' | null = null;

      if (registrationData.used_credit && registrationData.credit_type) {
        creditGroupToReturn = registrationData.credit_type as 'group' | 'private';
      } else if (
        !registrationData.used_credit &&
        typeof registrationData.purchase_price === 'number' &&
        registrationData.purchase_price > 0
      ) {
        if (registrationData.class.category === 'subscription') creditGroupToReturn = 'group';
        if (registrationData.class.category === 'private') creditGroupToReturn = 'private';
      }

      if (creditGroupToReturn) {
        logger.info(`Cancellation credit return path detected for user ${registrationData.user_id}, credit_type: ${creditGroupToReturn}, returnCredit: ${returnCredit}`);
        if (returnCredit === false) {
          logger.info('Admin chose not to return credit. Skipping credit return.');
        } else {
          const creditAdded = await addCredit(registrationData.user_id, creditGroupToReturn);
          if (!creditAdded) {
            logger.warn(`Failed to add credit for user ${registrationData.user_id}, credit_type: ${creditGroupToReturn}.`);
          } else {
            logger.info(`Credit returned successfully for user ${registrationData.user_id}, credit_type: ${creditGroupToReturn}`);
          }
        }
      }
    }

    // If admin re-activates a previously cancelled registration, deduct the credit again (if requested)
    if (registrationData.status === 'cancelled' && status === 'active') {
      let creditGroupToDeduct: 'group' | 'private' | null = null;
      if (registrationData.used_credit && registrationData.credit_type) {
        creditGroupToDeduct = registrationData.credit_type as 'group' | 'private';
      } else if (
        !registrationData.used_credit &&
        typeof registrationData.purchase_price === 'number' &&
        registrationData.purchase_price > 0
      ) {
        if (registrationData.class.category === 'subscription') creditGroupToDeduct = 'group';
        if (registrationData.class.category === 'private') creditGroupToDeduct = 'private';
      }

      if (creditGroupToDeduct) {
        if (deductCreditOption === false) {
          logger.info('Admin chose not to deduct credit on re-activation. Skipping deduction.');
        } else {
        logger.info(`Re-activation detected, attempting to deduct credit for user ${registrationData.user_id}, credit_type: ${creditGroupToDeduct}`);
        const deducted = await deductCredit(registrationData.user_id, creditGroupToDeduct);
        if (!deducted) {
          logger.warn(`Failed to deduct credit on re-activation for user ${registrationData.user_id}, credit_type: ${creditGroupToDeduct}`);
        } else {
          logger.info(`Credit deducted successfully on re-activation for user ${registrationData.user_id}, credit_type: ${creditGroupToDeduct}`);
        }
        }
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
      .eq('id', req.user!.sub)
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
      query = query.eq('user_id', req.user!.sub);
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

    // If this is a trial class being cancelled, remove per-class usage record to allow re-register (user endpoint)
    if ((registrationData.class.category || '').toLowerCase() === 'trial') {
      logger.info(`Trial class cancellation detected for user ${registrationData.user_id}`);
      const { error: deleteUsageError } = await supabase
        .from('user_trial_classes')
        .delete()
        .eq('user_id', registrationData.user_id)
        .eq('class_id', registrationData.class_id);
      if (deleteUsageError) {
        logger.error('Failed to delete trial usage record on cancel (user endpoint):', deleteUsageError);
      } else {
        logger.info(`Trial usage record removed (user endpoint) for user ${registrationData.user_id} and class ${registrationData.class_id}`);
      }
    }

    // If this is a subscription class being cancelled and was paid with credit, return the credit
    if (registrationData.used_credit && registrationData.credit_type) {
      logger.info(`Subscription class cancellation with credit detected for user ${registrationData.user_id}, credit_type: ${registrationData.credit_type}`);
      
      const creditAdded = await addCredit(registrationData.user_id, registrationData.credit_type);
      
      if (!creditAdded) {
        logger.warn(`Failed to add credit for user ${registrationData.user_id}, credit_type: ${registrationData.credit_type}. Cancellation will proceed without credit return.`);
        // Don't fail the cancellation, just log the warning
        // This ensures registration can still succeed even if credit handling fails
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
      .eq('id', req.user!.sub)
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
      query = query.eq('user_id', req.user!.sub);
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