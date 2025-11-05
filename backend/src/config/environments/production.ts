/**
 * Production Environment Configuration
 * These are default values for production environment
 */

export const productionConfig = {
  // Minimal logging in production
  logging: {
    level: 'error',
    format: 'json',
  },

  // Strong security for production
  security: {
    bcryptRounds: 12,
  },

  // Strict CORS (must be configured via env vars)
  cors: {
    origins: [], // Must be explicitly set in .env
  },

  // Database sync disabled
  database: {
    sync: false,
    logging: false,
    ssl: true,
  },

  // Standard rate limits
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
  },
};
