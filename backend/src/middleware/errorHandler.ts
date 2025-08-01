import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log('=== ERROR HANDLER TRIGGERED ===');
  console.log('Error:', err);
  console.log('Error name:', err.name);
  console.log('Error message:', err.message);
  console.log('Error stack:', err.stack);
  console.log('Request URL:', req.url);
  console.log('Request method:', req.method);
  
  logger.error('Error handler triggered:', {
    error: err.message,
    name: err.name,
    url: req.url,
    method: req.method,
    stack: err.stack
  });

  if (err instanceof AppError) {
    console.log('AppError detected, status:', err.statusCode);
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }

  console.log('Generic error, returning 500');
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
}; 