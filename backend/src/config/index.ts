import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.BACKEND_PORT || '5000', 10),
  host: process.env.BACKEND_HOST || 'localhost',

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'freshroute_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },

  testDatabase: {
    host: process.env.TEST_DB_HOST || 'localhost',
    port: parseInt(process.env.TEST_DB_PORT || '5432', 10),
    name: process.env.TEST_DB_NAME || 'freshroute_test_db',
    user: process.env.TEST_DB_USER || 'postgres',
    password: process.env.TEST_DB_PASSWORD || '',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  rateLimit: {
    login: {
      max: parseInt(process.env.RATE_LIMIT_LOGIN_MAX || '5', 10),
      windowMs: parseInt(process.env.RATE_LIMIT_LOGIN_WINDOW || '900000', 10), // 15 minutes
    },
    registration: {
      max: parseInt(process.env.RATE_LIMIT_REGISTER_MAX || '3', 10),
      windowMs: parseInt(process.env.RATE_LIMIT_REGISTER_WINDOW || '3600000', 10), // 1 hour
    },
    general: {
      max: parseInt(process.env.RATE_LIMIT_GENERAL_MAX || '100', 10),
      windowMs: parseInt(process.env.RATE_LIMIT_GENERAL_WINDOW || '900000', 10), // 15 minutes
    },
  },

  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  },
};

export default config;
