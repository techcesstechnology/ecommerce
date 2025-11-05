/**
 * Configuration Validation Utilities
 * Validates environment variables and ensures all required configurations are present
 */

import { ENV_KEYS, Environment } from './env.types';

/**
 * Validation error class
 */
export class ConfigValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}

/**
 * Required environment variables for all environments
 */
const REQUIRED_ENV_VARS = [
  ENV_KEYS.DB_HOST,
  ENV_KEYS.DB_PORT,
  ENV_KEYS.DB_NAME,
  ENV_KEYS.DB_USER,
  ENV_KEYS.JWT_SECRET,
  ENV_KEYS.JWT_REFRESH_SECRET,
];

/**
 * Required environment variables for production
 */
const REQUIRED_PROD_ENV_VARS = [...REQUIRED_ENV_VARS, ENV_KEYS.DB_PASSWORD, ENV_KEYS.DB_SSL];

/**
 * Helper function to validate port numbers
 */
function validatePort(portValue: string | undefined, portName: string): void {
  if (
    portValue &&
    (isNaN(Number(portValue)) || Number(portValue) < 1 || Number(portValue) > 65535)
  ) {
    throw new ConfigValidationError(`${portName} must be a valid port number (1-65535)`);
  }
}

/**
 * Validates that required environment variables are present
 */
export function validateRequiredEnvVars(): void {
  const env = process.env.NODE_ENV || Environment.DEVELOPMENT;
  const requiredVars = env === Environment.PRODUCTION ? REQUIRED_PROD_ENV_VARS : REQUIRED_ENV_VARS;
  const missingVars: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    throw new ConfigValidationError(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
}

/**
 * Validates JWT secret strength
 */
export function validateJWTSecrets(): void {
  const jwtSecret = process.env[ENV_KEYS.JWT_SECRET];
  const jwtRefreshSecret = process.env[ENV_KEYS.JWT_REFRESH_SECRET];

  if (jwtSecret && jwtSecret.length < 32) {
    throw new ConfigValidationError('JWT_SECRET must be at least 32 characters long for security');
  }

  if (jwtRefreshSecret && jwtRefreshSecret.length < 32) {
    throw new ConfigValidationError(
      'JWT_REFRESH_SECRET must be at least 32 characters long for security'
    );
  }

  if (jwtSecret === jwtRefreshSecret) {
    throw new ConfigValidationError('JWT_SECRET and JWT_REFRESH_SECRET must be different');
  }
}

/**
 * Validates database configuration
 */
export function validateDatabaseConfig(): void {
  validatePort(process.env[ENV_KEYS.DB_PORT], 'DB_PORT');

  const env = process.env.NODE_ENV;
  if (env === Environment.PRODUCTION) {
    const dbPassword = process.env[ENV_KEYS.DB_PASSWORD];
    if (!dbPassword || dbPassword.length < 8) {
      throw new ConfigValidationError(
        'DB_PASSWORD must be at least 8 characters long in production'
      );
    }
  }
}

/**
 * Validates port configuration
 */
export function validatePortConfig(): void {
  validatePort(process.env[ENV_KEYS.BACKEND_PORT], 'BACKEND_PORT');
  validatePort(process.env[ENV_KEYS.REDIS_PORT], 'REDIS_PORT');
  validatePort(process.env[ENV_KEYS.EMAIL_PORT], 'EMAIL_PORT');
}

/**
 * Validates business configuration
 */
export function validateBusinessConfig(): void {
  const taxRate = process.env[ENV_KEYS.TAX_RATE];
  if (taxRate && (isNaN(Number(taxRate)) || Number(taxRate) < 0 || Number(taxRate) > 1)) {
    throw new ConfigValidationError(
      'TAX_RATE must be a decimal between 0 and 1 (e.g., 0.15 for 15%)'
    );
  }

  const shippingFeeBase = process.env[ENV_KEYS.SHIPPING_FEE_BASE];
  if (shippingFeeBase && (isNaN(Number(shippingFeeBase)) || Number(shippingFeeBase) < 0)) {
    throw new ConfigValidationError('SHIPPING_FEE_BASE must be a positive number');
  }

  const shippingFeePerKm = process.env[ENV_KEYS.SHIPPING_FEE_PER_KM];
  if (shippingFeePerKm && (isNaN(Number(shippingFeePerKm)) || Number(shippingFeePerKm) < 0)) {
    throw new ConfigValidationError('SHIPPING_FEE_PER_KM must be a positive number');
  }
}

/**
 * Validates rate limit configuration
 */
export function validateRateLimitConfig(): void {
  const windowMs = process.env[ENV_KEYS.RATE_LIMIT_WINDOW_MS];
  if (windowMs && (isNaN(Number(windowMs)) || Number(windowMs) < 1000)) {
    throw new ConfigValidationError('RATE_LIMIT_WINDOW_MS must be at least 1000 (1 second)');
  }

  const maxRequests = process.env[ENV_KEYS.RATE_LIMIT_MAX_REQUESTS];
  if (maxRequests && (isNaN(Number(maxRequests)) || Number(maxRequests) < 1)) {
    throw new ConfigValidationError('RATE_LIMIT_MAX_REQUESTS must be a positive number');
  }
}

/**
 * Validates environment value
 */
export function validateEnvironment(): Environment {
  const env = process.env.NODE_ENV || Environment.DEVELOPMENT;

  if (!Object.values(Environment).includes(env as Environment)) {
    throw new ConfigValidationError(
      `Invalid NODE_ENV: ${env}. Must be one of: ${Object.values(Environment).join(', ')}`
    );
  }

  return env as Environment;
}

/**
 * Validates CORS origins
 */
export function validateCORSOrigins(origins: string): void {
  const originList = origins.split(',').map((o) => o.trim());

  for (const origin of originList) {
    if (origin !== '*' && !isValidURL(origin)) {
      throw new ConfigValidationError(`Invalid CORS origin: ${origin}. Must be a valid URL or '*'`);
    }
  }
}

/**
 * Helper function to validate URLs
 */
function isValidURL(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Main validation function - runs all validations
 */
export function validateConfig(): void {
  try {
    validateEnvironment();
    validateRequiredEnvVars();
    validateJWTSecrets();
    validateDatabaseConfig();
    validatePortConfig();
    validateBusinessConfig();
    validateRateLimitConfig();
  } catch (error) {
    if (error instanceof ConfigValidationError) {
      console.error('❌ Configuration validation failed:', error.message);
      throw error;
    }
    throw error;
  }
}

/**
 * Parses a boolean environment variable
 */
export function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Parses an integer environment variable
 */
export function parseInteger(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Parses a float environment variable
 */
export function parseFloat(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = Number.parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Parses a string array from comma-separated values
 */
export function parseArray(value: string | undefined, defaultValue: string[]): string[] {
  if (!value) return defaultValue;
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/**
 * Gets a required environment variable or throws an error
 */
export function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new ConfigValidationError(`Required environment variable ${key} is not set`);
  }
  return value;
}

/**
 * Gets an optional environment variable with a default value
 */
export function getOptionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}
