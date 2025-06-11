import { Router } from 'express';
import { supabase } from '../database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { auth } from '../middleware/auth';
import { CLASS_REGISTRATION_STATUS } from '../constants';

const router = Router();

// Get user's class registrations
router.get('/', auth, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('class_registrations')
      .select('*, classes(*)')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch registrations', 500);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Get registration by ID
router.get('/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('class_registrations')
      .select('*, classes(*)')
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .single();

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

// Register for a class
router.post('/', auth, async (req, res, next) => {
  try {
    const { class_id } = req.body;

    // Check if class exists
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('*')
      .eq('id', class_id)
      .single();

    if (classError || !classData) {
      throw new AppError('Class not found', 404);
    }

    // Check if already registered
    const { data: existingRegistration, error: checkError } = await supabase
      .from('class_registrations')
      .select('*')
      .eq('user_id', req.user!.id)
      .eq('class_id', class_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw new AppError('Failed to check registration', 500);
    }

    if (existingRegistration) {
      throw new AppError('Already registered for this class', 400);
    }

    // Create registration
    const { data, error } = await supabase
      .from('class_registrations')
      .insert([{
        user_id: req.user!.id,
        class_id,
        status: CLASS_REGISTRATION_STATUS.PENDING
      }])
      .select()
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
router.put('/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(CLASS_REGISTRATION_STATUS).includes(status)) {
      throw new AppError('Invalid registration status', 400);
    }

    const { data, error } = await supabase
      .from('class_registrations')
      .update({ status })
      .eq('id', id)
      .select()
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

export default router; 