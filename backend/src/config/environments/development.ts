/**
 * Development Environment Configuration
 * These are default values for development environment
 */

export const developmentConfig = {
  // Enable verbose logging
  logging: {
    level: 'debug',
    format: 'text',
  },

  // Relaxed security for development
  security: {
    bcryptRounds: 10, // Faster for development
  },

  // Permissive CORS for local development
  cors: {
    origins: ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:19006'],
  },

  // Database sync enabled
  database: {
    sync: true,
    logging: true,
  },

  // Higher rate limits for development
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 1000, // Very high for development
  },
};
