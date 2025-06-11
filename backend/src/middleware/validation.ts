import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export const validateClass = (req: Request, res: Response, next: NextFunction) => {
  const { title, description, price } = req.body;
  
  if (!title || !description || !price) {
    throw new AppError('Missing required fields', 400);
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