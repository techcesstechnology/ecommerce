import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { getConfig } from '../config';

// Get rate limit configuration
const config = getConfig();
const rateLimitConfig = config.getRateLimitConfig();

/**
 * Rate limiter for login attempts
 * Prevents brute force attacks
 */
export const loginLimiter = rateLimit({
  windowMs: rateLimitConfig.loginWindowMs,
  max: rateLimitConfig.loginMaxRequests,
  message: {
    error: 'Too Many Requests',
    message: 'Too many login attempts. Please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false,
  validate: { trustProxy: false }, // Skip trust proxy validation (we're intentionally behind a proxy)
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Too many login attempts from this IP. Please try again after 15 minutes.',
    });
  },
});

/**
 * Rate limiter for registration
 * Prevents spam registrations
 */
export const registerLimiter = rateLimit({
  windowMs: rateLimitConfig.registerWindowMs,
  max: rateLimitConfig.registerMaxRequests,
  message: {
    error: 'Too Many Requests',
    message: 'Too many registration attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  validate: { trustProxy: false }, // Skip trust proxy validation (we're intentionally behind a proxy)
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Too many registration attempts from this IP. Please try again after 1 hour.',
    });
  },
});

/**
 * Rate limiter for password reset requests
 * Prevents abuse of password reset functionality
 */
export const passwordResetLimiter = rateLimit({
  windowMs: rateLimitConfig.passwordResetWindowMs,
  max: rateLimitConfig.passwordResetMaxRequests,
  message: {
    error: 'Too Many Requests',
    message: 'Too many password reset requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  validate: { trustProxy: false }, // Skip trust proxy validation (we're intentionally behind a proxy)
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Too many password reset requests from this IP. Please try again after 1 hour.',
    });
  },
});

/**
 * General API rate limiter
 * Prevents API abuse
 */
export const apiLimiter = rateLimit({
  windowMs: rateLimitConfig.windowMs,
  max: rateLimitConfig.maxRequests,
  message: {
    error: 'Too Many Requests',
    message: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false }, // Skip trust proxy validation (we're intentionally behind a proxy)
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'API rate limit exceeded. Please try again after 15 minutes.',
    });
  },
});
