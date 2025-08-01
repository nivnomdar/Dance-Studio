import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export const validateClass = (req: Request, res: Response, next: NextFunction) => {
  const { name, description, price, slug } = req.body;
  
  if (!name || !description || !price || !slug) {
    throw new AppError('Missing required fields: name, description, price, and slug are required', 400);
  }
  
  // Validate price is a positive number
  if (typeof price !== 'number' || price <= 0) {
    throw new AppError('Price must be a positive number', 400);
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

export const validateProduct = (req: Request, res: Response, next: NextFunction) => {
  const { name, description, price } = req.body;
  
  if (!name || !description || !price) {
    throw new AppError('Missing required fields', 400);
  }
  
  next();
}; 