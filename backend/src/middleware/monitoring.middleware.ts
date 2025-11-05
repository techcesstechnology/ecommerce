/**
 * Monitoring Middleware
 * Integrates APM, Sentry, and analytics tracking with Express requests
 */

import { Request, Response, NextFunction } from 'express';
import { apmService } from '../services/apm.service';
import { sentryService } from '../services/sentry.service';
import { LoggerService, getCorrelationId } from '../services/logger.service';

/**
 * Middleware to add correlation ID to requests
 */
export const correlationIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Get or generate correlation ID
  const correlationId = getCorrelationId(req);
  req.correlationId = correlationId;

  // Add correlation ID to response headers
  res.setHeader('X-Correlation-ID', correlationId);

  // Create logger instance with correlation ID for this request
  req.monitoringLogger = new LoggerService('Request', correlationId);

  next();
};

/**
 * Middleware to track performance metrics with APM
 */
export const apmMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (!apmService.isEnabled()) {
    return next();
  }

  // Start APM transaction
  const transactionName = `${req.method} ${req.route?.path || req.path}`;
  const transactionId = apmService.startTransaction(transactionName, 'request', {
    method: req.method,
    url: req.originalUrl,
    correlation_id: req.correlationId,
  });

  req.transactionId = transactionId;
  req.startTime = Date.now();

  // Add request metadata to transaction
  if (transactionId) {
    apmService.addTransactionTag(transactionId, 'method', req.method);
    apmService.addTransactionTag(transactionId, 'path', req.path);

    if (req.correlationId) {
      apmService.addTransactionTag(transactionId, 'correlation_id', req.correlationId);
    }
  }

  // End transaction on response finish
  res.on('finish', () => {
    if (transactionId) {
      const duration = Date.now() - (req.startTime || Date.now());
      const success = res.statusCode < 400;

      apmService.setTransactionAttribute(transactionId, 'status_code', res.statusCode);
      apmService.setTransactionAttribute(transactionId, 'duration', duration);
      apmService.endTransaction(transactionId, success, {
        status_code: res.statusCode,
        duration,
      });

      // Record response time metric
      apmService.recordMetric({
        name: 'http.response_time',
        value: duration,
        type: 'histogram',
        tags: {
          method: req.method,
          path: req.route?.path || req.path,
          status: res.statusCode.toString(),
        },
      });
    }
  });

  next();
};

/**
 * Middleware to set up Sentry context for requests
 */
export const sentryMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (!sentryService.isEnabled()) {
    return next();
  }

  // Set request context
  sentryService.setRequestContext(req);

  // Add correlation ID as tag
  if (req.correlationId) {
    sentryService.setTag('correlation_id', req.correlationId);
  }

  // Add breadcrumb for request
  sentryService.addBreadcrumb({
    message: `${req.method} ${req.originalUrl}`,
    category: 'http',
    level: 'info',
    data: {
      method: req.method,
      url: req.originalUrl,
      status_code: res.statusCode,
    },
  });

  next();
};

/**
 * Middleware to track request/response timing
 */
export const requestTimingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  req.startTime = startTime;

  // Log request
  if (req.monitoringLogger) {
    req.monitoringLogger.info('Incoming request', {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      user_agent: req.get('user-agent'),
    });
  }

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    if (req.monitoringLogger) {
      req.monitoringLogger.logResponse(req, res.statusCode, duration);
    }
  });

  next();
};

/**
 * Combined monitoring middleware (applies all monitoring in correct order)
 */
export const monitoringMiddleware = [
  correlationIdMiddleware,
  apmMiddleware,
  sentryMiddleware,
  requestTimingMiddleware,
];

/**
 * Error tracking middleware (should be used in error handlers)
 */
export const trackError = (error: Error, req: Request): void => {
  // Track in APM
  if (apmService.isEnabled() && req.transactionId) {
    apmService.recordError(error, req.transactionId);
  }

  // Track in Sentry
  if (sentryService.isEnabled()) {
    sentryService.captureException(error, {
      tags: {
        correlation_id: req.correlationId || 'unknown',
        method: req.method,
        path: req.path,
      },
      extra: {
        url: req.originalUrl,
        query: req.query,
        params: req.params,
        body: req.body,
      },
    });
  }

  // Log error
  if (req.monitoringLogger) {
    req.monitoringLogger.error('Request error', error, {
      method: req.method,
      url: req.originalUrl,
      status_code: 500,
    });
  }
};
