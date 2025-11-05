/**
 * Test Environment Configuration
 * These are default values for test environment
 */

export const testConfig = {
  // Minimal logging for tests
  logging: {
    level: 'error',
    format: 'text',
  },

  // Fast hashing for tests
  security: {
    bcryptRounds: 4, // Minimum for speed
  },

  // Permissive CORS for tests
  cors: {
    origins: ['http://localhost:3000'],
  },

  // Test database configuration
  database: {
    sync: true,
    logging: false,
  },

  // No rate limiting in tests
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 10000,
  },
};
