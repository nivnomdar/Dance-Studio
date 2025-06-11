import { Router, Request, Response, NextFunction } from 'express';
import { supabase } from '../database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { validateClass } from '../middleware/validation';
import { auth } from '../middleware/auth';

const router = Router();

// Get all classes
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch classes', 500);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Get class by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new AppError('Failed to fetch class', 500);
    }

    if (!data) {
      throw new AppError('Class not found', 404);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Create new class (admin only)
router.post('/', auth, validateClass, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('classes')
      .insert([req.body])
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to create class', 500);
    }

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

// Update class (admin only)
router.put('/:id', auth, validateClass, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('classes')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to update class', 500);
    }

    if (!data) {
      throw new AppError('Class not found', 404);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Delete class (admin only)
router.delete('/:id', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id);

    if (error) {
      throw new AppError('Failed to delete class', 500);
    }

    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router; 