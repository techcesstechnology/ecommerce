# Monitoring, Logging, and Analytics Guide

This document provides comprehensive information about the monitoring, logging, and analytics infrastructure implemented in the FreshRoute application.

## Table of Contents

1. [Overview](#overview)
2. [Configuration](#configuration)
3. [Logging](#logging)
4. [Application Performance Monitoring (APM)](#application-performance-monitoring-apm)
5. [Error Tracking (Sentry)](#error-tracking-sentry)
6. [Analytics](#analytics)
7. [Health Checks](#health-checks)
8. [Usage Examples](#usage-examples)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

## Overview

The FreshRoute application includes a comprehensive monitoring stack that provides:

- **Structured Logging**: Winston-based logging with correlation IDs and rate limiting
- **APM (Application Performance Monitoring)**: Transaction tracking and custom metrics
- **Error Tracking**: Sentry integration for error monitoring and debugging
- **Analytics**: Event tracking for user behavior and business metrics
- **Health Checks**: Detailed system health endpoints for observability

All monitoring services are **optional** and can be enabled/disabled via environment variables.

## Configuration

### Environment Variables

Add the following variables to your `.env` file:

```bash
# Logging Configuration
LOG_LEVEL=debug                    # Options: error, warn, info, debug, verbose
LOG_FORMAT=json                    # Options: json, text
LOG_DIRECTORY=./logs              # Directory for log files

# APM Monitoring (Optional)
APM_ENABLED=false                 # Enable/disable APM
APM_SERVICE_NAME=freshroute-backend
APM_API_KEY=your_apm_api_key      # API key for your APM provider
APM_SAMPLING_RATE=0.1             # Sample rate (0.0-1.0)

# Sentry Error Tracking (Optional)
SENTRY_ENABLED=false              # Enable/disable Sentry
SENTRY_DSN=your_sentry_dsn        # Sentry DSN from your project
SENTRY_TRACES_SAMPLE_RATE=0.1    # Performance traces sample rate
SENTRY_PROFILES_SAMPLE_RATE=0.1  # Profiling sample rate

# Analytics (Optional)
ANALYTICS_ENABLED=false           # Enable/disable analytics
ANALYTICS_PROVIDER=mock           # Options: segment, mixpanel, amplitude, mock
ANALYTICS_API_KEY=your_analytics_api_key
```

### Configuration Access

The configuration can be accessed through the `ConfigService`:

```typescript
import { getConfig } from '../config';

const config = getConfig();
const monitoringConfig = config.getMonitoringConfig();
const sentryConfig = config.getSentryConfig();
const apmConfig = config.getApmConfig();
const analyticsConfig = config.getAnalyticsConfig();
```

## Logging

### Logger Service

The enhanced `LoggerService` provides structured logging with correlation IDs and metadata support.

#### Basic Usage

```typescript
import { LoggerService } from '../services/logger.service';

const logger = new LoggerService('MyService');

// Log messages
logger.info('User logged in', { user_id: '123' });
logger.warn('High memory usage detected');
logger.error('Database connection failed', error);
logger.debug('Processing request', { request_id: 'abc' });
```

#### With Correlation IDs

```typescript
import { LoggerService, generateCorrelationId } from '../services/logger.service';

const correlationId = generateCorrelationId();
const logger = new LoggerService('MyService', correlationId);

logger.info('Starting transaction', {
  correlation_id: correlationId,
  user_id: '123',
});
```

#### Request/Response Logging

```typescript
// In a middleware or route handler
if (req.monitoringLogger) {
  req.monitoringLogger.logRequest(req, responseTime);
  req.monitoringLogger.logResponse(req, statusCode, responseTime);
}
```

### Log Levels

- `error`: Application errors that need immediate attention
- `warn`: Warning messages for potential issues
- `info`: General informational messages
- `debug`: Detailed debugging information
- `verbose`: Very detailed debugging information

### Rate Limiting

The logger automatically rate limits messages to prevent log flooding:
- Maximum 100 logs per minute per unique message
- Prevents excessive logging from loops or repeated errors

### Log Files

Logs are automatically rotated daily:
- Location: `./logs` (configurable)
- Max file size: 20MB
- Retention: 14 days
- Files: `error-YYYY-MM-DD.log`, `combined-YYYY-MM-DD.log`, `http-YYYY-MM-DD.log`

## Application Performance Monitoring (APM)

The APM service provides transaction tracking and custom metrics collection.

### Basic Usage

```typescript
import { apmService } from '../services/apm.service';

// Start a transaction
const transactionId = apmService.startTransaction('ProcessOrder', 'background', {
  order_id: '123',
  user_id: '456',
});

// Add metadata
apmService.setTransactionAttribute(transactionId, 'payment_method', 'credit_card');
apmService.addTransactionTag(transactionId, 'environment', 'production');

// End the transaction
apmService.endTransaction(transactionId, true, {
  duration: 500,
  status: 'success',
});
```

### Recording Custom Metrics

```typescript
// Record a gauge metric
apmService.recordMetric({
  name: 'active_users',
  value: 42,
  type: 'gauge',
  tags: { region: 'us-east' },
});

// Record a counter
apmService.recordMetric({
  name: 'orders_processed',
  value: 1,
  type: 'counter',
});

// Record a histogram (e.g., response times)
apmService.recordMetric({
  name: 'api_response_time',
  value: 150,
  type: 'histogram',
  tags: { endpoint: '/api/orders' },
});
```

### Tracking Errors

```typescript
try {
  // Some operation
} catch (error) {
  apmService.recordError(error, transactionId);
}
```

## Error Tracking (Sentry)

Sentry integration provides rich error context and debugging information.

### Capturing Exceptions

```typescript
import { sentryService } from '../services/sentry.service';

try {
  // Some operation
} catch (error) {
  sentryService.captureException(error, {
    user: {
      id: '123',
      email: 'user@example.com',
    },
    tags: {
      feature: 'checkout',
      payment_method: 'stripe',
    },
    extra: {
      order_id: '456',
      cart_items: 5,
    },
  });
}
```

### Capturing Messages

```typescript
sentryService.captureMessage('Payment gateway timeout', 'warning', {
  tags: { gateway: 'stripe' },
  extra: { timeout_duration: 30000 },
});
```

### Adding Breadcrumbs

Breadcrumbs help you understand the sequence of events leading to an error:

```typescript
sentryService.addBreadcrumb({
  message: 'User clicked checkout button',
  category: 'user-action',
  level: 'info',
  data: {
    cart_value: 99.99,
    items_count: 3,
  },
});
```

### Setting User Context

```typescript
// Set user context
sentryService.setUser({
  id: '123',
  email: 'user@example.com',
  username: 'john_doe',
});

// Clear user context (e.g., on logout)
sentryService.clearUser();
```

### Setting Tags and Context

```typescript
// Set individual tag
sentryService.setTag('feature', 'checkout');

// Set multiple tags
sentryService.setTags({
  version: '1.0.0',
  environment: 'production',
  region: 'us-east-1',
});

// Set extra context
sentryService.setExtra('order_details', orderObject);
```

## Analytics

The analytics service tracks user behavior and business metrics.

### Tracking Events

```typescript
import { analyticsService } from '../services/analytics.service';

// Track a custom event
await analyticsService.trackEvent({
  eventName: 'Button Clicked',
  userId: '123',
  properties: {
    button_name: 'checkout',
    page: '/cart',
  },
});
```

### User Identification

```typescript
await analyticsService.identifyUser('123', {
  email: 'user@example.com',
  name: 'John Doe',
  role: 'customer',
  createdAt: new Date(),
});
```

### E-commerce Events

```typescript
// Product viewed
await analyticsService.trackProductViewed('123', {
  productId: 'prod_456',
  productName: 'Fresh Apples',
  category: 'Fruits',
  price: 5.99,
  currency: 'USD',
});

// Product added to cart
await analyticsService.trackProductAddedToCart('123', {
  productId: 'prod_456',
  productName: 'Fresh Apples',
  quantity: 2,
  price: 5.99,
});

// Checkout started
await analyticsService.trackCheckoutStarted('123', {
  orderId: 'order_789',
  revenue: 99.99,
  tax: 8.00,
  shipping: 5.00,
});

// Order completed
await analyticsService.trackOrderCompleted('123', {
  orderId: 'order_789',
  revenue: 112.99,
  products: ['prod_456', 'prod_789'],
  paymentMethod: 'credit_card',
});
```

### User Activity Events

```typescript
// Signup
await analyticsService.trackSignup('123', {
  method: 'email',
  referrer: 'google',
});

// Login
await analyticsService.trackLogin('123', {
  method: 'password',
  device: 'mobile',
});

// Logout
await analyticsService.trackLogout('123');
```

### Search Events

```typescript
await analyticsService.trackSearch('123', 'organic apples', 15);
```

## Health Checks

The application provides multiple health check endpoints for monitoring and orchestration.

### Endpoints

#### Basic Health Check

```
GET /api/health
```

Returns basic health status:

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected"
}
```

#### Detailed Health Check

```
GET /api/health/detailed
```

Returns comprehensive system health:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "version": "v1",
  "environment": "production",
  "checks": {
    "database": {
      "status": "up",
      "responseTime": 5
    },
    "redis": {
      "status": "up",
      "responseTime": 2
    },
    "memory": {
      "status": "ok",
      "used": 256,
      "total": 512,
      "percentage": 50
    },
    "cpu": {
      "status": "ok",
      "loadAverage": [1.5, 1.2, 1.0],
      "cores": 4
    }
  },
  "monitoring": {
    "apm": {
      "enabled": true,
      "activeTransactions": 5
    },
    "sentry": {
      "enabled": true
    },
    "analytics": {
      "enabled": true,
      "queueSize": 10
    }
  }
}
```

#### Readiness Check

```
GET /api/health/ready
```

For container orchestration (returns 200 when ready, 503 when not):

```json
{
  "ready": true
}
```

#### Liveness Check

```
GET /api/health/live
```

Simple check that the service is running:

```json
{
  "alive": true,
  "uptime": 3600
}
```

## Usage Examples

### Complete Request Flow with Monitoring

```typescript
import { Router } from 'express';
import { apmService } from '../services/apm.service';
import { analyticsService } from '../services/analytics.service';
import { sentryService } from '../services/sentry.service';

const router = Router();

router.post('/orders', async (req, res, next) => {
  // Start APM transaction
  const transactionId = apmService.startTransaction('CreateOrder', 'request', {
    correlation_id: req.correlationId,
  });

  try {
    // Add breadcrumb for Sentry
    sentryService.addBreadcrumb({
      message: 'Creating new order',
      category: 'order',
      data: { items_count: req.body.items?.length },
    });

    // Process order
    const order = await orderService.createOrder(req.body);

    // Track analytics event
    await analyticsService.trackOrderCompleted(req.user.id, {
      orderId: order.id,
      revenue: order.total,
      items: order.items.length,
    });

    // Record success metric
    apmService.recordMetric({
      name: 'orders_created',
      value: 1,
      type: 'counter',
    });

    // End transaction successfully
    apmService.endTransaction(transactionId, true);

    res.json(order);
  } catch (error) {
    // Track error in all systems
    apmService.recordError(error, transactionId);
    
    sentryService.captureException(error, {
      tags: { operation: 'create_order' },
      extra: { order_data: req.body },
    });

    await analyticsService.trackError(req.user.id, error, {
      operation: 'create_order',
    });

    // End transaction with failure
    apmService.endTransaction(transactionId, false);

    next(error);
  }
});

export default router;
```

### Middleware Integration

The monitoring middleware is automatically applied to all requests:

```typescript
// In server.ts
import { monitoringMiddleware } from './middleware/monitoring.middleware';

// Apply monitoring middleware
app.use(monitoringMiddleware);
```

This adds:
- Correlation ID to every request
- APM transaction tracking
- Sentry context
- Request/response timing
- Automatic error tracking

## Best Practices

### 1. Use Correlation IDs

Always use correlation IDs for tracking requests across services:

```typescript
// The middleware automatically adds correlation ID to req.correlationId
const logger = new LoggerService('MyService', req.correlationId);
```

### 2. Add Context to Errors

Provide rich context when capturing errors:

```typescript
sentryService.captureException(error, {
  user: { id: req.user.id },
  tags: { feature: 'payment', method: 'stripe' },
  extra: { order_id, transaction_id },
});
```

### 3. Use Appropriate Log Levels

- `error`: Only for actual errors requiring attention
- `warn`: For recoverable issues
- `info`: For important business events
- `debug`: For development debugging

### 4. Track Business Metrics

Use analytics for business-critical events:

```typescript
// Good - tracks meaningful business event
await analyticsService.trackOrderCompleted(userId, orderData);

// Avoid - too granular
await analyticsService.trackEvent({ eventName: 'ButtonHovered' });
```

### 5. Use Sampling Rates

Configure appropriate sampling rates for production:

```bash
# Balance between observability and costs
APM_SAMPLING_RATE=0.1          # 10% of requests
SENTRY_TRACES_SAMPLE_RATE=0.1  # 10% of traces
```

### 6. Handle Monitoring Failures Gracefully

All monitoring services fail silently and don't block application flow:

```typescript
// Monitoring is always optional
if (apmService.isEnabled()) {
  apmService.recordMetric(/* ... */);
}
```

### 7. Clean Up Resources

Flush monitoring data on shutdown:

```typescript
process.on('SIGTERM', async () => {
  await analyticsService.flush();
  await sentryService.flush(2000);
});
```

## Troubleshooting

### Logs Not Appearing

1. Check log directory permissions: `chmod 755 ./logs`
2. Verify LOG_LEVEL is set correctly
3. Check disk space availability

### Sentry Not Capturing Errors

1. Verify `SENTRY_ENABLED=true` and DSN is set
2. Check that error is not in `ignoreErrors` list
3. Verify network connectivity to Sentry

### APM Not Recording Metrics

1. Verify `APM_ENABLED=true`
2. Check that API key is valid
3. Verify sampling rate is not 0

### High Memory Usage from Logs

1. Reduce log retention: Set `maxFiles` lower
2. Reduce log level in production: `LOG_LEVEL=error`
3. Implement log streaming instead of file storage

### Analytics Events Not Tracking

1. Verify `ANALYTICS_ENABLED=true`
2. Check API key validity
3. Call `flush()` to send queued events

### Health Check Shows Degraded Status

1. Check database connectivity
2. Verify Redis is running
3. Check system resources (memory, CPU)
4. Review application logs for errors

## Security Considerations

### 1. Sensitive Data

Never log or track sensitive information:

```typescript
// Bad - logs sensitive data
logger.info('User login', { password: user.password });

// Good - only logs non-sensitive data
logger.info('User login', { user_id: user.id });
```

### 2. PII (Personally Identifiable Information)

Be careful with user data in monitoring:

```typescript
// Sanitize user data before sending to Sentry
sentryService.setUser({
  id: user.id,
  // Don't include email in production
});
```

### 3. Rate Limiting

The logger has built-in rate limiting to prevent abuse and DoS.

### 4. Environment Variables

Never commit `.env` files. Use secret management in production.

## Performance Impact

All monitoring services are designed for minimal performance impact:

- **Logging**: Asynchronous file writes
- **APM**: Configurable sampling rate (default 10%)
- **Sentry**: Configurable sampling rates
- **Analytics**: Event queuing with batching

Expected overhead: < 5% in typical production scenarios.

## Support and Resources

- **Internal Documentation**: See code comments in service files
- **Winston Docs**: https://github.com/winstonjs/winston
- **Sentry Docs**: https://docs.sentry.io/platforms/node/
- **Health Check Best Practices**: https://12factor.net/

---

For questions or issues, please contact the DevOps team or create an issue in the repository.
