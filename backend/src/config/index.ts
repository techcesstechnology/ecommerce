/**
 * Configuration Module Entry Point
 * Exports all configuration-related types, services, and utilities
 */

// Export main configuration service
export { getConfig, ConfigService } from './config.service';

// Export types
export {
  Environment,
  AppConfig,
  DatabaseConfig,
  JWTConfig,
  APIConfig,
  RateLimitConfig,
  CORSConfig,
  RedisConfig,
  SecurityConfig,
  BusinessConfig,
  EmailConfig,
  StorageConfig,
  LoggingConfig,
  PaymentConfig,
  ENV_KEYS,
} from './env.types';

// Export validation utilities
export {
  ConfigValidationError,
  validateConfig,
  validateRequiredEnvVars,
  validateJWTSecrets,
  validateDatabaseConfig,
  validatePortConfig,
  validateBusinessConfig,
  validateRateLimitConfig,
  validateEnvironment,
  parseBoolean,
  parseInteger,
  parseFloat as parseFloatEnv,
  parseArray,
  getRequiredEnv,
  getOptionalEnv,
} from './config.validator';

// Export environment-specific configs
export { developmentConfig } from './environments/development';
export { productionConfig } from './environments/production';
export { testConfig } from './environments/test';
