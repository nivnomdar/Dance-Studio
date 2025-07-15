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
  const { class_id, first_name, last_name, phone, email, selected_date, selected_time } = req.body;
  
  if (!class_id || !first_name || !last_name || !phone || !email || !selected_date || !selected_time) {
    throw new AppError('Missing required fields: class_id, first_name, last_name, phone, email, selected_date, and selected_time are required', 400);
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError('Invalid email format', 400);
  }
  
  // Validate phone format (basic validation)
  // Remove non-digit characters for validation
  const phoneDigits = phone.replace(/\D/g, '');
  if (phoneDigits.length < 8) {
    throw new AppError('Phone number must be at least 8 digits', 400);
  }
  
  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(selected_date)) {
    throw new AppError('Invalid date format. Use YYYY-MM-DD', 400);
  }
  
  // Validate that date is not in the past
  const selectedDate = new Date(selected_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (selectedDate < today) {
    throw new AppError('Selected date cannot be in the past', 400);
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