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
      throw new AppError('Failed to fetch registrations', 500);
    }

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
    const {
      class_id,
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

    // Check if user already has a registration for this class
    const { data: existingRegistration, error: checkError } = await supabase
      .from('registrations')
      .select('*')
      .eq('user_id', req.user!.id)
      .eq('class_id', class_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw new AppError('Failed to check existing registration', 500);
    }

    if (existingRegistration) {
      throw new AppError('Already registered for this class', 400);
    }

    // Create registration
    const { data, error } = await supabase
      .from('registrations')
      .insert([{
        class_id,
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
        status: 'pending'
      }])
      .select(`
        *,
        class:classes(id, name, price, duration, level, category)
      `)
      .single();

    if (error) {
      throw new AppError('Failed to create registration', 500);
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
    const validStatuses = ['pending', 'confirmed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid status. Must be one of: pending, confirmed, cancelled', 400);
    }

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