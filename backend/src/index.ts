import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
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

const app = express();

// CORS configuration - MUST be before helmet
const allowedOrigins = [
  'https://dancestudio-ecru.vercel.app', // הדומיין הקבוע
  'https://ladance-byavigail.vercel.app', // ה-URL הנוכחי
  'http://localhost:5173' // לפיתוח
];

logger.info(`CORS Origins configured: ${allowedOrigins.join(', ')}`);
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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

// Error handling
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
}); 