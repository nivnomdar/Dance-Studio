import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

// Import routes
import authRoutes from './routes/auth';
import classesRoutes from './routes/classes';
import shopRoutes from './routes/shop';
import ordersRoutes from './routes/orders';
import registrationsRoutes from './routes/registrations';
import profilesRoutes from './routes/profiles';
import sessionsRoutes from './routes/sessions';
import adminRoutes from './routes/admin';
import subscriptionCreditsRoutes from './routes/subscription-credits';
import contactRoutes from './routes/contact';
import activityLogRoutes from './routes/activityLog';

const app = express();

// Trust proxy for production environments (Render, Cloudflare, etc.)
// This is required for express-rate-limit to work correctly with X-Forwarded-For headers
const trustProxy = process.env.TRUST_PROXY ? parseInt(process.env.TRUST_PROXY) : 1;
app.set('trust proxy', trustProxy);

logger.info(`Trust proxy enabled: ${app.get('trust proxy')}`);
logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
logger.info(`Port: ${config.port}`);

// CORS configuration - MUST be before helmet
const allowedOrigins = [
  'https://dancestudio-ecru.vercel.app', // הדומיין הקבוע
  'https://ladance-byavigail.vercel.app', // ה-URL הנוכחי
  'https://www.ladances.com', // הדומיין הרשמי
  'http://localhost:5173' // לפיתוח
];

logger.info(`CORS Origins configured: ${allowedOrigins.join(', ')}`);
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in the allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } 
    // Allow Vercel preview deployments (pattern: *.vercel.app)
    else if (origin.endsWith('.vercel.app')) {
      callback(null, true);
    }
    else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'expires',
    'cache-control',
    'pragma'
  ]
}));

// Middleware
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// Cookie and Session middleware
app.use(cookieParser());

// Use a more production-safe session configuration
// In production, consider using Redis or database-based session store
const sessionConfig: any = {
  name: 'ladances-session',
  secret: process.env.SESSION_SECRET || 'ladances-dance-studio-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 שעות
    path: '/'
  }
};

// In production, use a more robust session store
if (process.env.NODE_ENV === 'production') {
  // For now, disable sessions in production to avoid MemoryStore issues
  // TODO: Implement Redis or database session store
  console.log('Production mode: Sessions disabled to avoid MemoryStore issues');
} else {
  // Development mode: use sessions
  app.use(session(sessionConfig));
}

// Rate limiting
app.use(rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max
}));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!', corsOrigin: config.cors.origin });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/registrations', registrationsRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/subscription-credits', subscriptionCreditsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api', activityLogRoutes);

// Error handling
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
}); 