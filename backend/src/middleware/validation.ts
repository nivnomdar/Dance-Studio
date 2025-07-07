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

export const validateProduct = (req: Request, res: Response, next: NextFunction) => {
  const { name, description, price } = req.body;
  
  if (!name || !description || !price) {
    throw new AppError('Missing required fields', 400);
  }
  
  next();
}; 