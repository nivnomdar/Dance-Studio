import { Router, Request, Response, NextFunction } from 'express';
import { supabase } from '../database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { validateProductCreate, validateProductUpdate } from '../middleware/validation';
import { admin, auth } from '../middleware/auth';

const router = Router();

// Get all categories (flat)
router.get('/categories', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new AppError('Failed to fetch categories', 500);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Create category (admin)
router.post('/categories', admin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([req.body])
      .select()
      .single();
    if (error) throw new AppError('Failed to create category', 500);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

// Update category (admin)
router.put('/categories/:id', admin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('categories')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new AppError('Failed to update category', 500);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Delete category (admin)
router.delete('/categories/:id', admin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) throw new AppError('Failed to delete category', 500);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get all products
router.get('/products', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category_id } = req.query as { category_id?: string };
    let query = supabase
      .from('products')
      .select('*, categories:category_id(id, name, parent_id)')
      .order('created_at', { ascending: false });

    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    const { data, error } = await query;

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
router.post('/products', admin, validateProductCreate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Allow only known columns that exist in products table
    const {
      name,
      category_id,
      description,
      price,
      stock_quantity,
      is_active,
      main_image,
      gallery_images
    } = req.body;

    const payload: any = {
      name,
      category_id,
      description,
      price,
      stock_quantity,
      is_active,
      main_image,
      gallery_images
    };

    const { data, error } = await supabase
      .from('products')
      .insert([payload])
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
router.put('/products/:id', admin, validateProductUpdate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    // Allow only known columns that exist in products table
    const {
      name,
      category_id,
      description,
      price,
      stock_quantity,
      is_active,
      main_image,
      gallery_images
    } = req.body;

    const payload: any = {
      name,
      category_id,
      description,
      price,
      stock_quantity,
      is_active,
      main_image,
      gallery_images
    };

    const { data, error } = await supabase
      .from('products')
      .update(payload)
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
router.delete('/products/:id', admin, async (req: Request, res: Response, next: NextFunction) => {
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

// Deprecated legacy category endpoint kept for backward compatibility
router.get('/category/:category', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Map legacy category slug/name to category_id if exists
    const legacyCategoryName = req.params.category;
    const { data: category, error: catError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', legacyCategoryName)
      .single();

    if (catError || !category) {
      return res.json([]);
    }

    const { data: products, error } = await supabase
      .from('products')
      .select('*, categories:category_id(id, name, parent_id)')
      .eq('category_id', category.id)
      .order('created_at', { ascending: false });

    if (error) throw new AppError(error.message, 500);

    res.json(products);
  } catch (error) {
    next(error);
  }
});

export default router; 