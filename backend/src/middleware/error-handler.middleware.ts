/**
 * Error Handler Middleware
 * Global error handling with structured logging and monitoring integration
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../services/logger.service';
import { trackError } from './monitoring.middleware';

/**
 * Error response interface
 */
interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  code?: string;
  errors?: any[];
  stack?: string;
  correlationId?: string;
}

/**
 * Check if running in production
 */
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Default error properties
  let statusCode = 500;
  let message = 'Internal server error';
  let code: string | undefined;
  let errors: any[] | undefined;
  let isOperational = false;

  // Handle AppError instances
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
    isOperational = err.isOperational;

    // Include validation errors if present
    if ('errors' in err && Array.isArray(err.errors)) {
      errors = err.errors;
    }
  }

  // Track error in monitoring services
  trackError(err, req);

  // Log error with appropriate level
  const logContext = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    statusCode,
    code,
    isOperational,
    correlation_id: req.correlationId,
  };

  if (statusCode >= 500) {
    logger.error(message, err.stack, JSON.stringify(logContext));
  } else if (statusCode >= 400) {
    logger.warn(message, JSON.stringify(logContext));
  } else {
    logger.info(message, JSON.stringify(logContext));
  }

  // Build error response
  const errorResponse: ErrorResponse = {
    error: statusCode >= 500 ? 'Internal Server Error' : err.name || 'Error',
    message: isProduction && !isOperational ? 'Something went wrong' : message,
    statusCode,
  };

  // Add correlation ID for tracking
  if (req.correlationId) {
    errorResponse.correlationId = req.correlationId;
  }

  // Add optional fields
  if (code) errorResponse.code = code;
  if (errors) errorResponse.errors = errors;

  // Include stack trace only in development mode
  if (isDevelopment && err.stack) {
    errorResponse.stack = err.stack;
  }

  // Send response
  res.status(statusCode).json(errorResponse);
};

/**
 * Not Found handler (404)
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  logger.warn(
    `404 Not Found: ${req.method} ${req.originalUrl}`,
    JSON.stringify({
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
    })
  );

  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    statusCode: 404,
    path: req.originalUrl,
  });
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
