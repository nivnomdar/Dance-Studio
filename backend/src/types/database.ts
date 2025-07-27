import { User } from '@supabase/supabase-js';
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

export interface DatabaseConnection {
  isConnected: boolean;
  error?: string;
}

export interface QueryResult<T = any> {
  data: T[];
  count: number;
  error?: string;
}

 