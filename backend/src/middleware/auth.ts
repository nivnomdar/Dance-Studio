import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';

// JWT payload interface
interface JWTPayload {
  sub: string; // user ID
  email: string;
  aud: string;
  exp: number;
  iat: number;
  role?: string;
  [key: string]: any;
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // קבל את ה-token מה-headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Auth middleware: No authorization header or invalid format. Proceeding as guest.');
      req.user = undefined; // Set user to undefined for guest access
      return next(); // Proceed to next middleware/route
    }

    const token = authHeader.substring(7); // הסר את "Bearer "
    console.log('Auth middleware: Token extracted, length:', token.length);

    // בדוק את ה-token עם JWT verification
    try {
      // Get JWT secret from environment
      const jwtSecret = process.env.SUPABASE_JWT_SECRET;
      if (!jwtSecret) {
        console.error('SUPABASE_JWT_SECRET not found in environment variables');
        throw new AppError('Server configuration error', 500);
      }

      // Verify the JWT token with the secret
      const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
      
      if (!decoded || !decoded.sub) {
        console.log('Auth middleware: Invalid token structure');
        throw new AppError('Invalid token structure', 401);
      }

      // Check if token is expired
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        console.log('Auth middleware: Token expired');
        throw new AppError('Token expired', 401);
      }

      console.log('Auth middleware: User authenticated successfully:', decoded.sub);
      req.user = decoded;
      next();
    } catch (jwtError) {
      console.log('Auth middleware: JWT verification failed:', jwtError);
      if (jwtError instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid token', 401);
      } else if (jwtError instanceof jwt.TokenExpiredError) {
        throw new AppError('Token expired', 401);
      } else {
        throw new AppError('Invalid or expired token', 401);
      }
    }
  } catch (error) {
    console.log('Auth middleware: Error:', error);
    next(error);
  }
};

export const admin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // קבל את ה-token מה-headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No authorization token provided', 401);
    }

    const token = authHeader.substring(7);

    // בדוק את ה-token עם JWT verification
    try {
      // Get JWT secret from environment
      const jwtSecret = process.env.SUPABASE_JWT_SECRET;
      if (!jwtSecret) {
        console.error('SUPABASE_JWT_SECRET not found in environment variables');
        throw new AppError('Server configuration error', 500);
      }

      // Verify the JWT token with the secret
      const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
      
      if (!decoded || !decoded.sub) {
        throw new AppError('Invalid token structure', 401);
      }

      // Check if token is expired
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        throw new AppError('Token expired', 401);
      }

      // בדוק אם המשתמש הוא מנהל
      // Note: We'll need to check the role from the database since it's not in the JWT
      // For now, we'll use the user ID from the token
      req.user = decoded;
      next();
    } catch (jwtError) {
      if (jwtError instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid token', 401);
      } else if (jwtError instanceof jwt.TokenExpiredError) {
        throw new AppError('Token expired', 401);
      } else {
        throw new AppError('Invalid or expired token', 401);
      }
    }
  } catch (error) {
    next(error);
  }
}; 