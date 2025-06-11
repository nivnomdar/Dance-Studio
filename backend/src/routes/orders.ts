import { Router, Request, Response, NextFunction } from 'express';
import { supabase } from '../database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { auth } from '../middleware/auth';
import { ORDER_STATUS } from '../constants';

const router = Router();

// Get user's orders
router.get('/', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch orders', 500);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Get order by ID
router.get('/:id', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .single();

    if (error) {
      throw new AppError('Failed to fetch order', 500);
    }

    if (!data) {
      throw new AppError('Order not found', 404);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Create new order
router.post('/', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        ...req.body,
        user_id: req.user!.id,
        status: ORDER_STATUS.PENDING
      }])
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to create order', 500);
    }

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

// Update order status (admin only)
router.put('/:id', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(ORDER_STATUS).includes(status)) {
      throw new AppError('Invalid order status', 400);
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to update order', 500);
    }

    if (!data) {
      throw new AppError('Order not found', 404);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router; 