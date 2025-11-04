/**
 * Environment Variable Type Definitions
 *
 * Provides type definitions for environment variables used in the application
 * Ensures type safety when accessing process.env
 */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Application Environment
      NODE_ENV: 'development' | 'production' | 'test';

      // Backend Configuration
      BACKEND_PORT: string;
      BACKEND_HOST: string;

      // Database Configuration
      DB_HOST: string;
      DB_PORT: string;
      DB_NAME: string;
      DB_USER: string;
      DB_PASSWORD: string;

      // Test Database Configuration (optional)
      TEST_DB_HOST?: string;
      TEST_DB_PORT?: string;
      TEST_DB_NAME?: string;
      TEST_DB_USER?: string;
      TEST_DB_PASSWORD?: string;

      // Redis Configuration
      REDIS_HOST: string;
      REDIS_PORT: string;
      REDIS_PASSWORD?: string;

      // JWT Configuration
      JWT_SECRET: string;
      JWT_EXPIRES_IN: string;

      // Rate Limiting Configuration (optional, have defaults)
      RATE_LIMIT_LOGIN_MAX?: string;
      RATE_LIMIT_LOGIN_WINDOW?: string;
      RATE_LIMIT_REGISTER_MAX?: string;
      RATE_LIMIT_REGISTER_WINDOW?: string;
      RATE_LIMIT_GENERAL_MAX?: string;
      RATE_LIMIT_GENERAL_WINDOW?: string;

      // CORS Configuration
      CORS_ORIGIN: string;

      // Payment Gateway (For future implementation)
      PAYMENT_API_KEY?: string;
      PAYMENT_API_SECRET?: string;

      // Email Configuration (For future implementation)
      EMAIL_HOST?: string;
      EMAIL_PORT?: string;
      EMAIL_USER?: string;
      EMAIL_PASSWORD?: string;

      // AWS/Cloud Storage (For future implementation)
      AWS_ACCESS_KEY_ID?: string;
      AWS_SECRET_ACCESS_KEY?: string;
      AWS_REGION?: string;
      S3_BUCKET_NAME?: string;
    }
  }
}

export {};
