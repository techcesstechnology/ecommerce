/**
 * Configuration Validator Tests
 */

import {
  ConfigValidationError,
  validateRequiredEnvVars,
  validateJWTSecrets,
  validateDatabaseConfig,
  validatePortConfig,
  validateBusinessConfig,
  validateRateLimitConfig,
  validateEnvironment,
  validateCORSOrigins,
  parseBoolean,
  parseInteger,
  parseFloat as parseFloatEnv,
  parseArray,
  getRequiredEnv,
  getOptionalEnv,
} from '../config/config.validator';
import { Environment } from '../config/env.types';

describe('Configuration Validator', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    
    // Set minimum required env vars for tests
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '5432';
    process.env.DB_NAME = 'test_db';
    process.env.DB_USER = 'test_user';
    process.env.JWT_SECRET = 'test_jwt_secret_at_least_32_characters_long_12345';
    process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_at_least_32_characters_long_12345';
    process.env.BACKEND_PORT = '5000';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('validateRequiredEnvVars', () => {
    it('should pass when all required vars are present', () => {
      expect(() => validateRequiredEnvVars()).not.toThrow();
    });

    it('should throw when required var is missing', () => {
      delete process.env.DB_HOST;
      expect(() => validateRequiredEnvVars()).toThrow(ConfigValidationError);
      expect(() => validateRequiredEnvVars()).toThrow(/DB_HOST/);
    });

    it('should require DB_PASSWORD in production', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.DB_PASSWORD;
      expect(() => validateRequiredEnvVars()).toThrow(ConfigValidationError);
      expect(() => validateRequiredEnvVars()).toThrow(/DB_PASSWORD/);
    });
  });

  describe('validateJWTSecrets', () => {
    it('should pass with valid JWT secrets', () => {
      expect(() => validateJWTSecrets()).not.toThrow();
    });

    it('should throw if JWT_SECRET is too short', () => {
      process.env.JWT_SECRET = 'short';
      expect(() => validateJWTSecrets()).toThrow(ConfigValidationError);
      expect(() => validateJWTSecrets()).toThrow(/at least 32 characters/);
    });

    it('should throw if JWT_REFRESH_SECRET is too short', () => {
      process.env.JWT_REFRESH_SECRET = 'short';
      expect(() => validateJWTSecrets()).toThrow(ConfigValidationError);
    });

    it('should throw if secrets are identical', () => {
      const secret = 'same_secret_at_least_32_characters_long_12345';
      process.env.JWT_SECRET = secret;
      process.env.JWT_REFRESH_SECRET = secret;
      expect(() => validateJWTSecrets()).toThrow(ConfigValidationError);
      expect(() => validateJWTSecrets()).toThrow(/must be different/);
    });
  });

  describe('validateDatabaseConfig', () => {
    it('should pass with valid database config', () => {
      expect(() => validateDatabaseConfig()).not.toThrow();
    });

    it('should throw if DB_PORT is invalid', () => {
      process.env.DB_PORT = 'invalid';
      expect(() => validateDatabaseConfig()).toThrow(ConfigValidationError);
    });

    it('should throw if DB_PORT is out of range', () => {
      process.env.DB_PORT = '70000';
      expect(() => validateDatabaseConfig()).toThrow(ConfigValidationError);
    });

    it('should require strong DB_PASSWORD in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.DB_PASSWORD = 'short';
      expect(() => validateDatabaseConfig()).toThrow(ConfigValidationError);
      expect(() => validateDatabaseConfig()).toThrow(/at least 8 characters/);
    });
  });

  describe('validatePortConfig', () => {
    it('should pass with valid port configs', () => {
      expect(() => validatePortConfig()).not.toThrow();
    });

    it('should throw if BACKEND_PORT is invalid', () => {
      process.env.BACKEND_PORT = 'invalid';
      expect(() => validatePortConfig()).toThrow(ConfigValidationError);
    });

    it('should throw if REDIS_PORT is out of range', () => {
      process.env.REDIS_PORT = '0';
      expect(() => validatePortConfig()).toThrow(ConfigValidationError);
    });

    it('should throw if EMAIL_PORT is invalid', () => {
      process.env.EMAIL_PORT = 'abc';
      expect(() => validatePortConfig()).toThrow(ConfigValidationError);
    });
  });

  describe('validateBusinessConfig', () => {
    it('should pass with valid business config', () => {
      process.env.TAX_RATE = '0.15';
      process.env.SHIPPING_FEE_BASE = '5.00';
      expect(() => validateBusinessConfig()).not.toThrow();
    });

    it('should throw if TAX_RATE is negative', () => {
      process.env.TAX_RATE = '-0.1';
      expect(() => validateBusinessConfig()).toThrow(ConfigValidationError);
    });

    it('should throw if TAX_RATE is greater than 1', () => {
      process.env.TAX_RATE = '1.5';
      expect(() => validateBusinessConfig()).toThrow(ConfigValidationError);
    });

    it('should throw if SHIPPING_FEE_BASE is negative', () => {
      process.env.SHIPPING_FEE_BASE = '-5';
      expect(() => validateBusinessConfig()).toThrow(ConfigValidationError);
    });

    it('should throw if SHIPPING_FEE_PER_KM is negative', () => {
      process.env.SHIPPING_FEE_PER_KM = '-1';
      expect(() => validateBusinessConfig()).toThrow(ConfigValidationError);
    });
  });

  describe('validateRateLimitConfig', () => {
    it('should pass with valid rate limit config', () => {
      process.env.RATE_LIMIT_WINDOW_MS = '60000';
      process.env.RATE_LIMIT_MAX_REQUESTS = '100';
      expect(() => validateRateLimitConfig()).not.toThrow();
    });

    it('should throw if RATE_LIMIT_WINDOW_MS is too small', () => {
      process.env.RATE_LIMIT_WINDOW_MS = '500';
      expect(() => validateRateLimitConfig()).toThrow(ConfigValidationError);
    });

    it('should throw if RATE_LIMIT_MAX_REQUESTS is not positive', () => {
      process.env.RATE_LIMIT_MAX_REQUESTS = '0';
      expect(() => validateRateLimitConfig()).toThrow(ConfigValidationError);
    });
  });

  describe('validateEnvironment', () => {
    it('should return valid environment', () => {
      process.env.NODE_ENV = 'production';
      expect(validateEnvironment()).toBe(Environment.PRODUCTION);
    });

    it('should default to development', () => {
      delete process.env.NODE_ENV;
      expect(validateEnvironment()).toBe(Environment.DEVELOPMENT);
    });

    it('should throw for invalid environment', () => {
      process.env.NODE_ENV = 'invalid';
      expect(() => validateEnvironment()).toThrow(ConfigValidationError);
    });
  });

  describe('validateCORSOrigins', () => {
    it('should pass with valid URLs', () => {
      expect(() => validateCORSOrigins('http://localhost:3000')).not.toThrow();
      expect(() => validateCORSOrigins('https://example.com')).not.toThrow();
    });

    it('should allow wildcard', () => {
      expect(() => validateCORSOrigins('*')).not.toThrow();
    });

    it('should pass with multiple valid URLs', () => {
      const origins = 'http://localhost:3000,https://example.com';
      expect(() => validateCORSOrigins(origins)).not.toThrow();
    });

    it('should throw with invalid URL', () => {
      expect(() => validateCORSOrigins('not-a-url')).toThrow(ConfigValidationError);
    });
  });

  describe('parseBoolean', () => {
    it('should parse "true" as true', () => {
      expect(parseBoolean('true', false)).toBe(true);
    });

    it('should parse "false" as false', () => {
      expect(parseBoolean('false', true)).toBe(false);
    });

    it('should parse "1" as true', () => {
      expect(parseBoolean('1', false)).toBe(true);
    });

    it('should return default for undefined', () => {
      expect(parseBoolean(undefined, true)).toBe(true);
      expect(parseBoolean(undefined, false)).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(parseBoolean('TRUE', false)).toBe(true);
      expect(parseBoolean('FALSE', true)).toBe(false);
    });
  });

  describe('parseInteger', () => {
    it('should parse valid integers', () => {
      expect(parseInteger('42', 0)).toBe(42);
      expect(parseInteger('0', 10)).toBe(0);
      expect(parseInteger('-5', 0)).toBe(-5);
    });

    it('should return default for undefined', () => {
      expect(parseInteger(undefined, 100)).toBe(100);
    });

    it('should return default for invalid values', () => {
      expect(parseInteger('abc', 50)).toBe(50);
      expect(parseInteger('12.5', 50)).toBe(12); // parseInt behavior
    });
  });

  describe('parseFloat', () => {
    it('should parse valid floats', () => {
      expect(parseFloatEnv('42.5', 0)).toBe(42.5);
      expect(parseFloatEnv('0.15', 0)).toBe(0.15);
      expect(parseFloatEnv('-3.14', 0)).toBe(-3.14);
    });

    it('should return default for undefined', () => {
      expect(parseFloatEnv(undefined, 1.5)).toBe(1.5);
    });

    it('should return default for invalid values', () => {
      expect(parseFloatEnv('abc', 2.0)).toBe(2.0);
    });
  });

  describe('parseArray', () => {
    it('should parse comma-separated values', () => {
      const result = parseArray('a,b,c', []);
      expect(result).toEqual(['a', 'b', 'c']);
    });

    it('should trim whitespace', () => {
      const result = parseArray('a, b , c', []);
      expect(result).toEqual(['a', 'b', 'c']);
    });

    it('should return default for undefined', () => {
      const result = parseArray(undefined, ['default']);
      expect(result).toEqual(['default']);
    });

    it('should filter empty strings', () => {
      const result = parseArray('a,,b', []);
      expect(result).toEqual(['a', 'b']);
    });
  });

  describe('getRequiredEnv', () => {
    it('should return value if present', () => {
      process.env.TEST_VAR = 'test_value';
      expect(getRequiredEnv('TEST_VAR')).toBe('test_value');
    });

    it('should throw if value is missing', () => {
      delete process.env.TEST_VAR;
      expect(() => getRequiredEnv('TEST_VAR')).toThrow(ConfigValidationError);
      expect(() => getRequiredEnv('TEST_VAR')).toThrow(/not set/);
    });
  });

  describe('getOptionalEnv', () => {
    it('should return value if present', () => {
      process.env.TEST_VAR = 'test_value';
      expect(getOptionalEnv('TEST_VAR', 'default')).toBe('test_value');
    });

    it('should return default if value is missing', () => {
      delete process.env.TEST_VAR;
      expect(getOptionalEnv('TEST_VAR', 'default')).toBe('default');
    });
  });
});
