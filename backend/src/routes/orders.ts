import { Router, Request, Response, NextFunction } from 'express';
import { supabase } from '../database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { auth } from '../middleware/auth';
import { ORDER_STATUS } from '../constants';

const router = Router();

// Get user's orders (with items enriched from order_items/products)
router.get('/', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items:order_items(
          id, product_id, quantity, unit_price,
          product:products(name, main_image)
        )
      `)
      .eq('user_id', req.user!.sub)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch orders', 500);
    }

    const normalized = (data || []).map((order: any) => ({
      ...order,
      items: (order.order_items || []).map((item: any) => ({
        product_id: item.product_id,
        name: item.product?.name || null,
        price: item.unit_price,
        quantity: item.quantity,
        image_url: item.product?.main_image || null
      }))
    }));

    res.json(normalized);
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
      .select(`
        *,
        order_items:order_items(
          id, product_id, quantity, unit_price,
          product:products(name, main_image)
        )
      `)
      .eq('id', id)
      .eq('user_id', req.user!.sub)
      .single();

    if (error) {
      throw new AppError('Failed to fetch order', 500);
    }

    if (!data) {
      throw new AppError('Order not found', 404);
    }

    const normalized = {
      ...data,
      items: (data.order_items || []).map((item: any) => ({
        product_id: item.product_id,
        name: item.product?.name || null,
        price: item.unit_price,
        quantity: item.quantity,
        image_url: item.product?.main_image || null
      }))
    };

    res.json(normalized);
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
        user_id: req.user!.sub,
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