import { Router, Request, Response, NextFunction } from 'express';
import { supabase } from '../database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { validateProduct } from '../middleware/validation';
import { auth } from '../middleware/auth';

const router = Router();

// Get all products
router.get('/products', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch products', 500);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Get product by ID
router.get('/products/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new AppError('Failed to fetch product', 500);
    }

    if (!data) {
      throw new AppError('Product not found', 404);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Create new product (admin only)
router.post('/products', auth, validateProduct, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([req.body])
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to create product', 500);
    }

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

// Update product (admin only)
router.put('/products/:id', auth, validateProduct, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('products')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to update product', 500);
    }

    if (!data) {
      throw new AppError('Product not found', 404);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Delete product (admin only)
router.delete('/products/:id', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      throw new AppError('Failed to delete product', 500);
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get products by category
router.get('/category/:category', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', req.params.category)
      .order('created_at', { ascending: false });

    if (error) throw new AppError(error.message, 500);

    res.json(products);
  } catch (error) {
    next(error);
  }
});

export default router; 