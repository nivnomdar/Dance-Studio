import dotenv from 'dotenv';

// Load environment variables - try multiple files
dotenv.config(); // Load .env
dotenv.config({ path: '.env.local' }); // Load .env.local
dotenv.config({ path: '.env.development' }); // Load .env.development

// Debug logging
console.log('Environment variables loaded:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? 'SET' : 'NOT SET');
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceKey: process.env.SUPABASE_SERVICE_KEY || ''
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
  },
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
    max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 300 // Increased from 100 to 300
  }
}; 