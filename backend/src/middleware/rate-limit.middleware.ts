/**
 * Rate Limiting Middleware
 *
 * Implements rate limiting for authentication endpoints using express-rate-limit
 * Provides IP-based rate limiting for enhanced security
 */

import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for login endpoint
 * Limit: 5 attempts per 15 minutes per IP
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: {
    error: 'Too many login attempts',
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip successful requests
  skipSuccessfulRequests: false,
  // Skip failed requests
  skipFailedRequests: false,
});

/**
 * Rate limiter for registration endpoint
 * Limit: 3 attempts per hour per IP
 */
export const registrationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 registration requests per windowMs
  message: {
    error: 'Too many registration attempts',
    message: 'Too many accounts created from this IP, please try again after an hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

/**
 * Rate limiter for general API endpoints
 * Limit: 100 requests per 15 minutes per IP
 */
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

/**
 * Configurable rate limiter factory
 * Allows creating custom rate limiters with specific configurations
 *
 * @param windowMs Time window in milliseconds
 * @param max Maximum number of requests allowed in the window
 * @param message Custom error message
 * @returns Configured rate limiter middleware
 */
export const createRateLimiter = (
  windowMs: number,
  max: number,
  message: string = 'Too many requests from this IP, please try again later'
) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Rate limit exceeded',
      message,
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};
