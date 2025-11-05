# Production Optimizations Documentation

This document describes the production optimizations implemented for the FreshRoute platform, including logging, caching, cloud storage, security enhancements, and error handling.

## Table of Contents

- [1. Logging System](#1-logging-system)
- [2. Redis Caching Layer](#2-redis-caching-layer)
- [3. AWS S3 Cloud Storage](#3-aws-s3-cloud-storage)
- [4. Security Enhancements](#4-security-enhancements)
- [5. Error Handling](#5-error-handling)
- [6. Configuration](#6-configuration)
- [7. Usage Examples](#7-usage-examples)

## 1. Logging System

### Overview

The platform uses **Winston** for application logging with multiple transports (console and file-based) and **Morgan** for HTTP request logging.

### Features

- **Multiple log levels**: error, warn, info, debug, verbose
- **Daily rotating file logs**: Automatic log rotation with configurable retention
- **Structured logging**: JSON format in production, colored console in development
- **HTTP request logging**: Integration with Morgan for request/response tracking
- **Context-aware logging**: Support for request IDs and contextual information

### Services

#### LoggerService

Located in `src/services/logger.service.ts`

```typescript
import { LoggerService } from './services/logger.service';

// Create logger with context
const logger = new LoggerService('UserService');

// Log messages
logger.error('Failed to create user', error.stack);
logger.warn('User attempted invalid action');
logger.info('User created successfully');
logger.debug('Debug information');
```

### Configuration

Set the following environment variables:

```bash
LOG_LEVEL=debug          # error, warn, info, debug, verbose
LOG_FORMAT=json          # json or text
LOG_DIRECTORY=./logs     # Directory for log files
```

### Log Files

- `error-YYYY-MM-DD.log`: Error-level logs only
- `combined-YYYY-MM-DD.log`: All logs
- `http-YYYY-MM-DD.log`: HTTP request logs
- Logs are retained for 14 days by default
- Maximum file size: 20MB

## 2. Redis Caching Layer

### Overview

Redis integration provides a high-performance caching layer with connection pooling, automatic reconnection, and error handling.

### Features

- **Connection pooling**: Efficient connection management
- **Automatic reconnection**: Resilient to Redis server restarts
- **Cache strategies**: Get, set, delete, pattern-based deletion
- **TTL support**: Configurable time-to-live for cache entries
- **Error handling**: Graceful degradation if Redis is unavailable

### Service

#### RedisService

Located in `src/services/redis.service.ts`

```typescript
import { redisService } from './services/redis.service';

// Store data
await redisService.set('user:123', userData, 3600); // TTL: 1 hour

// Retrieve data
const user = await redisService.get<User>('user:123');

// Delete data
await redisService.delete('user:123');

// Check existence
const exists = await redisService.exists('user:123');

// Delete by pattern
await redisService.deletePattern('user:*');

// Increment counter
await redisService.increment('api:calls', 1);
```

### Cache Middleware

Located in `src/middleware/cache.middleware.ts`

```typescript
import { cache } from './middleware/cache.middleware';

// Cache GET requests for 5 minutes
router.get('/products', cache({ ttl: 300 }), getProducts);

// Custom cache key prefix
router.get('/users', cache({ 
  ttl: 600, 
  keyPrefix: 'users' 
}), getUsers);

// Conditionally skip cache
router.get('/data', cache({
  ttl: 300,
  skipCache: (req) => req.query.refresh === 'true'
}), getData);
```

### Configuration

```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=          # Optional
REDIS_DB=0
```

## 3. AWS S3 Cloud Storage

### Overview

AWS S3 integration provides scalable cloud storage for images with automatic optimization using Sharp.

### Features

- **Image optimization**: Automatic resizing and format conversion
- **Multiple formats**: JPEG, PNG, WebP support
- **Signed URLs**: Secure, time-limited access to private files
- **CDN support**: Easy integration with CloudFront or other CDNs
- **Batch operations**: Upload, download, delete, list files

### Service

#### S3StorageService

Located in `src/services/s3.service.ts`

```typescript
import { s3StorageService } from './services/s3.service';

// Upload image with optimization
const result = await s3StorageService.upload(
  buffer,
  'profile.jpg',
  {
    optimize: true,
    optimizationOptions: {
      width: 800,
      height: 600,
      quality: 80,
      format: 'webp',
      fit: 'cover'
    },
    folder: 'profiles',
    contentType: 'image/jpeg'
  }
);

// Get file
const fileBuffer = await s3StorageService.get('profiles/abc123.webp');

// Delete file
await s3StorageService.delete('profiles/abc123.webp');

// Generate signed URL (valid for 1 hour)
const signedUrl = await s3StorageService.getSignedUrl(
  'profiles/abc123.webp',
  { expiresIn: 3600 }
);

// Get public URL
const publicUrl = s3StorageService.getPublicUrl('profiles/abc123.webp');

// Get CDN URL
const cdnUrl = s3StorageService.getCDNUrl('profiles/abc123.webp', 'd123.cloudfront.net');

// List files in folder
const files = await s3StorageService.list('profiles/', 100);

// Check if file exists
const exists = await s3StorageService.exists('profiles/abc123.webp');
```

### Image Optimization Options

```typescript
interface ImageOptimizationOptions {
  width?: number;           // Target width in pixels
  height?: number;          // Target height in pixels
  quality?: number;         // Quality (1-100), default: 80
  format?: 'jpeg' | 'png' | 'webp';  // Output format
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}
```

### Configuration

```bash
STORAGE_PROVIDER=aws     # local or aws
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name
```

## 4. Security Enhancements

### Overview

Production-grade security middleware providing HTTPS enforcement, enhanced headers, and request tracking.

### Features

- **HTTPS enforcement**: Automatic redirect to HTTPS in production
- **Security headers**: Enhanced security headers via Helmet and custom middleware
- **Request tracking**: Unique request IDs for tracing
- **HSTS**: HTTP Strict Transport Security with preload
- **CSP**: Content Security Policy configuration

### Middleware

Located in `src/middleware/security.middleware.ts`

#### HTTPS Enforcement

```typescript
import { enforceHTTPS } from './middleware/security.middleware';

// Automatically redirects HTTP to HTTPS in production
app.use(enforceHTTPS);
```

#### Security Headers

```typescript
import { securityHeaders } from './middleware/security.middleware';

// Adds additional security headers
app.use(securityHeaders);
```

Security headers applied:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`

#### Request Tracking

```typescript
import { requestId, requestLogger } from './middleware/security.middleware';

// Add unique request ID to each request
app.use(requestId);

// Log requests with request ID
app.use(requestLogger);
```

#### Production Middleware Bundle

```typescript
import { productionMiddleware } from './middleware/security.middleware';

// Apply all production middleware at once
if (config.isProduction()) {
  app.use(productionMiddleware);
}
```

## 5. Error Handling

### Overview

Comprehensive error handling system with custom error classes, global error handler, and structured error logging.

### Custom Error Classes

Located in `src/utils/errors.ts`

```typescript
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  TooManyRequestsError,
  InternalServerError,
  ServiceUnavailableError,
  DatabaseError,
  ExternalServiceError,
} from './utils/errors';

// Throw custom errors
throw new BadRequestError('Invalid email format', 'INVALID_EMAIL');
throw new NotFoundError('User not found');
throw new UnauthorizedError('Invalid credentials');
throw new ValidationError('Validation failed', [
  { field: 'email', message: 'Invalid email' }
]);
```

### Error Classes

| Class | Status Code | Use Case |
|-------|-------------|----------|
| `BadRequestError` | 400 | Invalid request parameters |
| `UnauthorizedError` | 401 | Authentication required |
| `ForbiddenError` | 403 | Insufficient permissions |
| `NotFoundError` | 404 | Resource not found |
| `ConflictError` | 409 | Resource conflict (e.g., duplicate email) |
| `ValidationError` | 422 | Input validation failed |
| `TooManyRequestsError` | 429 | Rate limit exceeded |
| `InternalServerError` | 500 | Server error |
| `ServiceUnavailableError` | 503 | Service temporarily unavailable |
| `DatabaseError` | 500 | Database operation failed |
| `ExternalServiceError` | 503 | External API failed |

### Global Error Handler

Located in `src/middleware/error-handler.middleware.ts`

```typescript
import { errorHandler, notFoundHandler, asyncHandler } from './middleware/error-handler.middleware';

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Wrap async route handlers
router.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await getUserById(req.params.id);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  res.json(user);
}));
```

### Process Error Monitoring

Implemented in `src/server.ts`:

```typescript
// Uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', error.stack);
  process.exit(1);
});

// Unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', reason?.stack);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing server');
  await closeDatabase();
  await closeRedis();
  process.exit(0);
});
```

## 6. Configuration

### Environment Variables

All services use the centralized configuration system. See `.env.example` for complete configuration options.

#### Key Settings

```bash
# Environment
NODE_ENV=production

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
LOG_DIRECTORY=./logs

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# AWS S3
STORAGE_PROVIDER=aws
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
S3_BUCKET_NAME=
```

## 7. Usage Examples

### Complete Route with All Features

```typescript
import { Router } from 'express';
import { cache, invalidateCache } from '../middleware/cache.middleware';
import { asyncHandler } from '../middleware/error-handler.middleware';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { logger } from '../services/logger.service';
import { s3StorageService } from '../services/s3.service';

const router = Router();
const routeLogger = new LoggerService('ProductRoutes');

// GET products with caching
router.get('/products', 
  cache({ ttl: 300, keyPrefix: 'products' }),
  asyncHandler(async (req, res) => {
    routeLogger.info('Fetching products');
    const products = await getProducts();
    res.json(products);
  })
);

// POST product with image upload
router.post('/products',
  asyncHandler(async (req, res) => {
    const { name, price, image } = req.body;
    
    if (!name || !price) {
      throw new BadRequestError('Name and price are required');
    }
    
    // Upload image to S3
    let imageUrl = null;
    if (image) {
      const imageBuffer = Buffer.from(image, 'base64');
      const result = await s3StorageService.upload(
        imageBuffer,
        `${name}-${Date.now()}.jpg`,
        {
          optimize: true,
          optimizationOptions: {
            width: 800,
            quality: 85,
            format: 'webp'
          },
          folder: 'products'
        }
      );
      imageUrl = result.url;
    }
    
    const product = await createProduct({ name, price, imageUrl });
    
    // Invalidate cache
    await invalidateCache('products:*');
    
    routeLogger.info(`Product created: ${product.id}`);
    res.status(201).json(product);
  })
);

// GET product by ID
router.get('/products/:id',
  asyncHandler(async (req, res) => {
    const product = await getProductById(req.params.id);
    
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    
    res.json(product);
  })
);

export default router;
```

### Error Handling Example

```typescript
import { asyncHandler } from '../middleware/error-handler.middleware';
import { 
  BadRequestError, 
  UnauthorizedError, 
  DatabaseError 
} from '../utils/errors';
import { logger } from '../services/logger.service';

router.post('/auth/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Validation
  if (!email || !password) {
    throw new BadRequestError('Email and password are required');
  }
  
  try {
    // Authenticate user
    const user = await authenticateUser(email, password);
    
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }
    
    const token = generateToken(user);
    res.json({ token, user });
    
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error; // Re-throw auth errors
    }
    
    // Log and wrap database errors
    logger.error('Database error during login', error.stack);
    throw new DatabaseError('Failed to authenticate user');
  }
}));
```

## Testing

All services include comprehensive unit tests:

- `src/__tests__/logger.service.test.ts`
- `src/__tests__/errors.test.ts`
- `src/__tests__/error-handler.middleware.test.ts`

Run tests:

```bash
cd backend
npm test
```

## Performance Considerations

1. **Redis Caching**: Cache frequently accessed data with appropriate TTLs
2. **Image Optimization**: Always optimize images before storing in S3
3. **Logging**: Use appropriate log levels (avoid debug in production)
4. **Error Handling**: Use custom errors for better error categorization
5. **Connection Pooling**: Redis and database connections are pooled automatically

## Security Best Practices

1. Always use HTTPS in production
2. Set strong JWT secrets (min 32 characters)
3. Configure proper CORS origins
4. Enable rate limiting
5. Use signed URLs for private S3 files
6. Keep dependencies updated
7. Monitor logs for security events

## Monitoring and Debugging

1. **Request IDs**: Each request has a unique ID for tracing
2. **Structured Logs**: JSON logs in production for easy parsing
3. **Error Stack Traces**: Available in development mode
4. **Redis Health**: Check connection status with `redisService.ping()`
5. **S3 Health**: Verify configuration with `s3StorageService.isReady()`

## Troubleshooting

### Redis Connection Issues

```bash
# Check Redis is running
redis-cli ping

# View logs
tail -f logs/error-*.log
```

### S3 Upload Failures

- Verify AWS credentials
- Check bucket permissions
- Ensure bucket exists in specified region
- Check file size limits

### High Memory Usage

- Reduce log file retention
- Optimize Redis cache TTLs
- Monitor image optimization sizes

## Additional Resources

- [Winston Documentation](https://github.com/winstonjs/winston)
- [Redis Node Documentation](https://github.com/redis/node-redis)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)
- [Sharp Image Processing](https://sharp.pixelplumbing.com/)
- [Helmet Security](https://helmetjs.github.io/)
