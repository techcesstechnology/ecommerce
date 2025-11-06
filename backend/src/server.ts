import 'reflect-metadata';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import path from 'path';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import cartRoutes from './routes/cart.routes';
import productRoutes from './routes/product.routes';
import reviewRoutes from './routes/review.routes';
import wishlistRoutes from './routes/wishlist.routes';
import orderRoutes from './routes/order.routes';
import adminRoutes from './routes/admin.routes';
import { initializeDatabase, closeDatabase } from './config/database.config';
import { apiLimiter } from './middleware/rate-limit.middleware';
import { sanitizeInput, preventNoSQLInjection } from './middleware/sanitization.middleware';
import { errorHandler, notFoundHandler } from './middleware/error-handler.middleware';
import { productionMiddleware, requestLogger } from './middleware/security.middleware';
import { getConfig } from './config';
import { logger, morganStream } from './services/logger.service';
import { initializeRedis, closeRedis } from './services/redis.service';

// Get configuration
const config = getConfig();
const apiConfig = config.getAPIConfig();
const corsConfig = config.getCORSConfig();

const app: Application = express();
const PORT = apiConfig.port;

// Trust proxy - important for rate limiting and getting correct IP addresses
app.set('trust proxy', apiConfig.trustProxy);

// Production-specific middleware (HTTPS enforcement, security headers, etc.)
if (config.isProduction()) {
  app.use(productionMiddleware);
}

// Request logger (for structured logging)
app.use(requestLogger);

// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Allow inline scripts for React
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"], // Allow API calls to same origin
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    crossOriginEmbedderPolicy: false, // Allow loading resources
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

// HTTP request logging with Winston
const morganFormat = config.isProduction() ? 'combined' : 'dev';
app.use(morgan(morganFormat, { stream: morganStream }));

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Serve frontend static files in production
if (config.isProduction()) {
  const frontendDistPath = path.join(__dirname, '../../frontend/dist');
  
  // Serve static files from frontend/dist
  app.use(express.static(frontendDistPath));
  
  // Handle React routing - send all non-API requests to index.html
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  // Development - show API info
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      message: 'Welcome to FreshRoute API',
      version: apiConfig.version,
      environment: config.getEnvironment(),
      endpoints: {
        health: `${apiConfig.prefix}/health`,
        auth: `${apiConfig.prefix}/auth`,
        cart: `${apiConfig.prefix}/cart`,
        products: `${apiConfig.prefix}/products`,
        reviews: `${apiConfig.prefix}/reviews`,
        wishlist: `${apiConfig.prefix}/wishlist`,
        orders: `${apiConfig.prefix}/orders`,
        admin: `${apiConfig.prefix}/admin`,
      },
    });
  });
  
  // 404 handler for development
  app.use(notFoundHandler);
}

// Global error handler - must be last
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    // Print configuration summary
    config.printConfigSummary();

    // Initialize database connection
    await initializeDatabase();
    logger.info('✅ Database initialized successfully');

    // Initialize Redis connection (non-blocking)
    await initializeRedis();

    // Start server only if not in test mode
    if (!config.isTest()) {
      app.listen(PORT, '0.0.0.0', () => {
        logger.info(`🚀 Server running on port ${PORT}`);
        logger.info(`📝 Environment: ${config.getEnvironment()}`);
        logger.info(`🌐 API URL: http://${apiConfig.host}:${PORT}${apiConfig.prefix}`);
      });
    }
  } catch (error: any) {
    logger.error('❌ Failed to start server', error.stack);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await closeDatabase();
  await closeRedis();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  await closeDatabase();
  await closeRedis();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception', error.stack);
  // Flush logs and exit
  logger.on('finish', () => process.exit(1));
  logger.end();
  // Fallback timeout in case logger doesn't finish
  setTimeout(() => process.exit(1), 5000);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection', reason?.stack || String(reason));
  // Flush logs and exit
  logger.on('finish', () => process.exit(1));
  logger.end();
  // Fallback timeout in case logger doesn't finish
  setTimeout(() => process.exit(1), 5000);
});

// Start the server
if (!config.isTest()) {
  startServer();
}

export default app;
