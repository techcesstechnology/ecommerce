/**
 * Security Middleware
 * Additional security middleware for production environments
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../services/logger.service';
import { getConfig } from '../config';

const config = getConfig();

/**
 * HTTPS Enforcement Middleware
 * Redirects HTTP requests to HTTPS in production
 */
export const enforceHTTPS = (req: Request, res: Response, next: NextFunction): void => {
  // Skip in development and test environments
  if (!config.isProduction()) {
    return next();
  }

  // Check if request is not secure
  if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
    logger.warn(`Redirecting to HTTPS: ${req.originalUrl}`);

    // Redirect to HTTPS
    return res.redirect(301, `https://${req.hostname}${req.originalUrl}`);
  }

  next();
};

/**
 * Strict Transport Security (HSTS) Headers
 * Already handled by Helmet, but can be customized here if needed
 */
export const hstsHeaders = (_req: Request, res: Response, next: NextFunction): void => {
  if (config.isProduction()) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  next();
};

/**
 * Security Headers Middleware
 * Additional security headers for production
 */
export const securityHeaders = (_req: Request, res: Response, next: NextFunction): void => {
  // X-Content-Type-Options
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // X-Frame-Options
  res.setHeader('X-Frame-Options', 'DENY');

  // X-XSS-Protection (for older browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer-Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions-Policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  next();
};

/**
 * Request ID Middleware
 * Adds a unique request ID to each request for tracing
 */
export const requestId = (req: Request, res: Response, next: NextFunction): void => {
  const requestId =
    req.get('X-Request-ID') || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};

/**
 * Request Logger Middleware
 * Logs incoming requests with request ID
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = req.get('X-Request-ID');
  const start = Date.now();

  // Log request
  logger.info(
    `→ ${req.method} ${req.originalUrl}`,
    JSON.stringify({
      requestId,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    })
  );

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(
      `← ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`,
      JSON.stringify({
        requestId,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration,
      })
    );
  });

  next();
};

/**
 * Production Middleware Configuration
 * Applies all production-specific middleware
 */
export const productionMiddleware = [requestId, enforceHTTPS, hstsHeaders, securityHeaders];
