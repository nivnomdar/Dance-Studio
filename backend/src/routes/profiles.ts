import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { AppError } from '../middleware/errorHandler';
import { Request, Response, NextFunction } from 'express';

const router = Router();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

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