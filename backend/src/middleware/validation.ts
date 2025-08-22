import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export const validateClass = (req: Request, res: Response, next: NextFunction) => {
  const { name, description, price, slug, class_type } = req.body;
  
  if (!name || !description || !price || !slug) {
    throw new AppError('Missing required fields: name, description, price, and slug are required', 400);
  }
  
  // Validate price is a positive number
  if (typeof price !== 'number' || price <= 0) {
    throw new AppError('Price must be a positive number', 400);
  }
  
  // Validate class_type if provided
  if (class_type && !['group', 'private', 'both'].includes(class_type)) {
    throw new AppError('class_type must be one of: group, private, or both', 400);
  }
  
  next();
};

export const validateRegistration = (req: Request, res: Response, next: NextFunction) => {
  console.log('=== VALIDATION MIDDLEWARE STARTED ===');
  console.log('Validation middleware received:', req.body);
  
  const { class_id, first_name, last_name, phone, email, selected_date, selected_time } = req.body;

  // Check required fields - phone is required again since admin can update it
  if (!class_id || !first_name || !last_name || !phone || !email || !selected_date || !selected_time) {
    console.log('=== VALIDATION FAILED ===');
    console.log('Missing required fields:', { class_id, first_name, last_name, phone, email, selected_date, selected_time });
    return res.status(400).json({
      error: 'כל השדות הם חובה: שיעור, שם פרטי, שם משפחה, טלפון, אימייל, תאריך ושעה'
    });
  }

  // Check for empty strings and convert them to null for validation
  if (!first_name || !last_name || !phone || !email || !selected_date || !selected_time || 
      first_name.trim() === '' || last_name.trim() === '' || phone.trim() === '' || email.trim() === '' || selected_date.trim() === '' || selected_time.trim() === '') {
    console.log('=== VALIDATION FAILED - EMPTY STRINGS ===');
    return res.status(400).json({
      error: 'כל השדות חייבים להיות מלאים ולא ריקים'
    });
  }

  // user_id אינו חובה מצד הלקוח. השרת מזהה את המשתמש המחובר ומאכף הרשאות במסלול עצמו

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.log('=== VALIDATION FAILED - EMAIL ===');
    return res.status(400).json({
      error: 'פורמט אימייל לא תקין'
    });
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(selected_date)) {
    console.log('=== VALIDATION FAILED - DATE ===');
    return res.status(400).json({
      error: 'פורמט תאריך לא תקין. יש להשתמש בפורמט YYYY-MM-DD'
    });
  }

  // Validate time format (HH:MM or HH:MM עד HH:MM)
  const timeRegex = /^\d{2}:\d{2}$/;
  const timeWithUntilRegex = /^\d{2}:\d{2}\s+עד\s+\d{2}:\d{2}$/;
  if (!timeRegex.test(selected_time) && !timeWithUntilRegex.test(selected_time)) {
    console.log('=== VALIDATION FAILED - TIME ===');
    return res.status(400).json({
      error: 'פורמט שעה לא תקין. יש להשתמש בפורמט HH:MM או HH:MM עד HH:MM'
    });
  }

  console.log('=== VALIDATION PASSED ===');
  next();
};

export const validateProductCreate = (req: Request, res: Response, next: NextFunction) => {
  const { name, description, price, category_id } = req.body;
  if (!name || typeof name !== 'string') {
    throw new AppError('Missing or invalid field: name', 400);
  }
  if (!description || typeof description !== 'string') {
    throw new AppError('Missing or invalid field: description', 400);
  }
  if (typeof price !== 'number' || isNaN(price) || price < 0) {
    throw new AppError('Missing or invalid field: price must be a non-negative number', 400);
  }
  if (!category_id || typeof category_id !== 'string') {
    throw new AppError('Missing or invalid field: category_id', 400);
  }
  next();
};

export const validateProductUpdate = (req: Request, res: Response, next: NextFunction) => {
  const body = req.body || {};
  if ('name' in body && (typeof body.name !== 'string' || body.name.trim() === '')) {
    throw new AppError('Invalid field: name', 400);
  }
  if ('description' in body && typeof body.description !== 'string') {
    throw new AppError('Invalid field: description', 400);
  }
  if ('price' in body && (typeof body.price !== 'number' || isNaN(body.price) || body.price < 0)) {
    throw new AppError('Invalid field: price must be a non-negative number', 400);
  }
  if ('category_id' in body && typeof body.category_id !== 'string') {
    throw new AppError('Invalid field: category_id', 400);
  }
  if ('stock_quantity' in body && (typeof body.stock_quantity !== 'number' || !Number.isInteger(body.stock_quantity) || body.stock_quantity < 0)) {
    throw new AppError('Invalid field: stock_quantity', 400);
  }
  if ('is_active' in body && typeof body.is_active !== 'boolean') {
    throw new AppError('Invalid field: is_active', 400);
  }
  if ('main_image' in body && body.main_image != null && typeof body.main_image !== 'string') {
    throw new AppError('Invalid field: main_image', 400);
  }
  if ('gallery_images' in body && body.gallery_images != null && !Array.isArray(body.gallery_images)) {
    throw new AppError('Invalid field: gallery_images must be an array', 400);
  }
  if ('trending' in body && typeof body.trending !== 'boolean') {
    throw new AppError('Invalid field: trending', 400);
  }
  if ('recommended' in body && typeof body.recommended !== 'boolean') {
    throw new AppError('Invalid field: recommended', 400);
  }
  next();
};