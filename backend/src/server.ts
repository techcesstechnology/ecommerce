import 'reflect-metadata';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import { initializeDatabase, closeDatabase } from './config/database.config';
import { apiLimiter } from './middleware/rate-limit.middleware';
import { sanitizeInput, preventNoSQLInjection } from './middleware/sanitization.middleware';
import { getConfig } from './config';

// Get configuration
const config = getConfig();
const apiConfig = config.getAPIConfig();
const corsConfig = config.getCORSConfig();

const app: Application = express();
const PORT = apiConfig.port;

// Trust proxy - important for rate limiting and getting correct IP addresses
app.set('trust proxy', apiConfig.trustProxy);

// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// CORS configuration
const corsOrigins = corsConfig.origins;

// Add Replit domain if available
if (process.env.REPLIT_DEV_DOMAIN) {
  corsOrigins.push(`https://${process.env.REPLIT_DEV_DOMAIN}`);
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (corsOrigins.indexOf(origin) !== -1 || corsOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: corsConfig.credentials,
    methods: corsConfig.allowedMethods,
    allowedHeaders: corsConfig.allowedHeaders,
  })
);

// Body parsing middleware
app.use(express.json({ limit: apiConfig.bodyLimit })); // Limit body size to prevent DoS
app.use(express.urlencoded({ extended: true, limit: apiConfig.bodyLimit }));

// Cookie parser
// Note: CSRF protection is not required for API-only backends that use JWT tokens
// in Authorization headers. CSRF attacks require cookies to be automatically sent,
// which doesn't happen with Bearer token authentication. If you add session-based
// authentication or forms, enable CSRF protection with a library like csurf.
app.use(cookieParser());

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(sanitizeInput);
app.use(preventNoSQLInjection);

// Prevent parameter pollution
app.use(hpp());

// Compression
app.use(compression());

// Logging
app.use(morgan('combined'));

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Welcome to FreshRoute API',
    version: apiConfig.version,
    environment: config.getEnvironment(),
    endpoints: {
      health: `${apiConfig.prefix}/health`,
      auth: `${apiConfig.prefix}/auth`,
    },
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
  });
});

// Error handler - secure error handling without exposing sensitive information
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err.stack);

  // Don't expose error details in production
  const message = config.isDevelopment() ? err.message : 'Something went wrong';

  res.status(500).json({
    error: 'Internal Server Error',
    message,
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // Print configuration summary
    config.printConfigSummary();

    // Initialize database connection
    await initializeDatabase();
    console.log('✅ Database initialized successfully');

    // Start server only if not in test mode
    if (!config.isTest()) {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📝 Environment: ${config.getEnvironment()}`);
        console.log(`🌐 API URL: http://${apiConfig.host}:${PORT}${apiConfig.prefix}`);
      });
    }
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await closeDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await closeDatabase();
  process.exit(0);
});

// Start the server
if (!config.isTest()) {
  startServer();
}

export default app;
