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
  const { first_name, last_name, phone, email, selected_date, selected_time } = req.body;

  // Debug log
  console.log('Validation - received data:', {
    first_name,
    last_name,
    phone,
    email,
    selected_date,
    selected_time
  });

  // Check required fields
  if (!first_name || !last_name || !phone || !email || !selected_date || !selected_time) {
    console.log('Validation failed - missing required fields');
    return res.status(400).json({
      error: 'כל השדות הם חובה: שם פרטי, שם משפחה, טלפון, אימייל, תאריך ושעה'
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: 'פורמט אימייל לא תקין'
    });
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(selected_date)) {
    return res.status(400).json({
      error: 'פורמט תאריך לא תקין. יש להשתמש בפורמט YYYY-MM-DD'
    });
  }

  // Validate time format (HH:MM)
  const timeRegex = /^\d{2}:\d{2}$/;
  console.log('Validation - time format check:', selected_time, 'matches regex:', timeRegex.test(selected_time));
  if (!timeRegex.test(selected_time)) {
    console.log('Validation failed - invalid time format');
    return res.status(400).json({
      error: 'פורמט שעה לא תקין. יש להשתמש בפורמט HH:MM'
    });
  }

  next();
};

export const validateProduct = (req: Request, res: Response, next: NextFunction) => {
  const { name, description, price } = req.body;
  
  if (!name || !description || !price) {
    throw new AppError('Missing required fields', 400);
  }
  
  next();
}; 