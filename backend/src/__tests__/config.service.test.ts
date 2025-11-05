/**
 * Configuration Service Tests
 */

import { ConfigService, Environment } from '../config';

describe('ConfigService', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };

    // Set minimum required env vars for tests
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '5432';
    process.env.DB_NAME = 'test_db';
    process.env.DB_USER = 'test_user';
    process.env.DB_PASSWORD = 'test_password';
    process.env.JWT_SECRET = 'test_jwt_secret_at_least_32_characters_long_12345';
    process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_at_least_32_characters_long_12345';
    process.env.BACKEND_PORT = '5000';

    // Reset singleton before each test
    ConfigService.resetInstance();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;

    // Reset singleton after each test
    ConfigService.resetInstance();
  });

  describe('Environment Detection', () => {
    it('should detect development environment', () => {
      process.env.NODE_ENV = 'development';
      const config = ConfigService.getInstance();
      expect(config.isDevelopment()).toBe(true);
      expect(config.isProduction()).toBe(false);
      expect(config.isTest()).toBe(false);
    });

    it('should detect production environment', () => {
      process.env.NODE_ENV = 'production';
      process.env.DB_SSL = 'true';
      const config = ConfigService.getInstance();
      expect(config.isProduction()).toBe(true);
      expect(config.isDevelopment()).toBe(false);
    });

    it('should detect test environment', () => {
      process.env.NODE_ENV = 'test';
      const config = ConfigService.getInstance();
      expect(config.isTest()).toBe(true);
      expect(config.isProduction()).toBe(false);
    });

    it('should default to development if NODE_ENV not set', () => {
      delete process.env.NODE_ENV;
      const config = ConfigService.getInstance();
      expect(config.getEnvironment()).toBe(Environment.DEVELOPMENT);
    });
  });

  describe('Database Configuration', () => {
    it('should load database configuration from environment', () => {
      process.env.DB_HOST = 'test-db-host';
      process.env.DB_PORT = '5433';
      process.env.DB_NAME = 'test_db';
      process.env.DB_USER = 'test_user';

      const config = ConfigService.getInstance();
      const dbConfig = config.getDatabaseConfig();

      expect(dbConfig.host).toBe('test-db-host');
      expect(dbConfig.port).toBe(5433);
      expect(dbConfig.name).toBe('test_db');
      expect(dbConfig.user).toBe('test_user');
    });

    it('should use default database port if not specified', () => {
      const config = ConfigService.getInstance();
      const dbConfig = config.getDatabaseConfig();
      expect(dbConfig.port).toBe(5432);
    });

    it('should enable SSL in production by default', () => {
      process.env.NODE_ENV = 'production';
      process.env.DB_SSL = 'true';
      const config = ConfigService.getInstance();
      const dbConfig = config.getDatabaseConfig();
      expect(dbConfig.ssl).toBe(true);
    });

    it('should disable SSL in development by default', () => {
      process.env.NODE_ENV = 'development';
      const config = ConfigService.getInstance();
      const dbConfig = config.getDatabaseConfig();
      expect(dbConfig.ssl).toBe(false);
    });
  });

  describe('JWT Configuration', () => {
    it('should load JWT configuration from environment', () => {
      const config = ConfigService.getInstance();
      const jwtConfig = config.getJWTConfig();

      expect(jwtConfig.secret).toBeDefined();
      expect(jwtConfig.refreshSecret).toBeDefined();
      expect(jwtConfig.expiresIn).toBeDefined();
      expect(jwtConfig.refreshExpiresIn).toBeDefined();
    });

    it('should have default JWT expiry times', () => {
      const config = ConfigService.getInstance();
      const jwtConfig = config.getJWTConfig();

      expect(jwtConfig.expiresIn).toBe('15m');
      expect(jwtConfig.refreshExpiresIn).toBe('7d');
    });

    it('should have issuer and audience', () => {
      const config = ConfigService.getInstance();
      const jwtConfig = config.getJWTConfig();

      expect(jwtConfig.issuer).toBe('freshroute');
      expect(jwtConfig.audience).toBe('freshroute-users');
    });
  });

  describe('API Configuration', () => {
    it('should load API configuration from environment', () => {
      process.env.BACKEND_PORT = '3000';
      process.env.BACKEND_HOST = 'api.example.com';

      const config = ConfigService.getInstance();
      const apiConfig = config.getAPIConfig();

      expect(apiConfig.port).toBe(3000);
      expect(apiConfig.host).toBe('api.example.com');
    });

    it('should use default API port if not specified', () => {
      delete process.env.BACKEND_PORT;
      const config = ConfigService.getInstance();
      const apiConfig = config.getAPIConfig();
      expect(apiConfig.port).toBe(5000);
    });

    it('should have API prefix and version', () => {
      const config = ConfigService.getInstance();
      const apiConfig = config.getAPIConfig();

      expect(apiConfig.prefix).toBe('/api');
      expect(apiConfig.version).toBe('v1');
    });
  });

  describe('Rate Limit Configuration', () => {
    it('should have default rate limit settings', () => {
      const config = ConfigService.getInstance();
      const rateLimitConfig = config.getRateLimitConfig();

      expect(rateLimitConfig.windowMs).toBe(15 * 60 * 1000);
      expect(rateLimitConfig.maxRequests).toBe(100);
    });

    it('should have specific login rate limits', () => {
      const config = ConfigService.getInstance();
      const rateLimitConfig = config.getRateLimitConfig();

      expect(rateLimitConfig.loginWindowMs).toBe(15 * 60 * 1000);
      expect(rateLimitConfig.loginMaxRequests).toBe(5);
    });

    it('should have specific registration rate limits', () => {
      const config = ConfigService.getInstance();
      const rateLimitConfig = config.getRateLimitConfig();

      expect(rateLimitConfig.registerWindowMs).toBe(60 * 60 * 1000);
      expect(rateLimitConfig.registerMaxRequests).toBe(3);
    });
  });

  describe('CORS Configuration', () => {
    it('should load CORS origins from environment', () => {
      process.env.CORS_ORIGIN = 'http://example.com,http://test.com';
      const config = ConfigService.getInstance();
      const corsConfig = config.getCORSConfig();

      expect(corsConfig.origins).toContain('http://example.com');
      expect(corsConfig.origins).toContain('http://test.com');
    });

    it('should have default CORS origins in development', () => {
      process.env.NODE_ENV = 'development';
      delete process.env.CORS_ORIGIN;
      const config = ConfigService.getInstance();
      const corsConfig = config.getCORSConfig();

      expect(corsConfig.origins.length).toBeGreaterThan(0);
    });

    it('should enable credentials', () => {
      const config = ConfigService.getInstance();
      const corsConfig = config.getCORSConfig();

      expect(corsConfig.credentials).toBe(true);
    });
  });

  describe('Business Configuration', () => {
    it('should have default tax rate', () => {
      const config = ConfigService.getInstance();
      const businessConfig = config.getBusinessConfig();

      expect(businessConfig.taxRate).toBe(0.15);
    });

    it('should load custom tax rate from environment', () => {
      process.env.TAX_RATE = '0.20';
      const config = ConfigService.getInstance();
      const businessConfig = config.getBusinessConfig();

      expect(businessConfig.taxRate).toBe(0.2);
    });

    it('should have default currency settings', () => {
      const config = ConfigService.getInstance();
      const businessConfig = config.getBusinessConfig();

      expect(businessConfig.currency).toBe('USD');
      expect(businessConfig.currencySymbol).toBe('$');
    });

    it('should have shipping configuration', () => {
      const config = ConfigService.getInstance();
      const businessConfig = config.getBusinessConfig();

      expect(businessConfig.shippingFeeBase).toBe(5.0);
      expect(businessConfig.shippingFeePerKm).toBe(0.5);
      expect(businessConfig.freeShippingThreshold).toBe(50.0);
    });

    it('should have order limits', () => {
      const config = ConfigService.getInstance();
      const businessConfig = config.getBusinessConfig();

      expect(businessConfig.minOrderAmount).toBe(10.0);
      expect(businessConfig.maxOrderAmount).toBe(10000.0);
    });
  });

  describe('Security Configuration', () => {
    it('should have default security settings', () => {
      const config = ConfigService.getInstance();
      const securityConfig = config.getSecurityConfig();

      expect(securityConfig.bcryptRounds).toBe(12);
      expect(securityConfig.passwordMinLength).toBe(8);
      expect(securityConfig.maxLoginAttempts).toBe(5);
    });

    it('should have lockout duration', () => {
      const config = ConfigService.getInstance();
      const securityConfig = config.getSecurityConfig();

      expect(securityConfig.lockoutDuration).toBe(15 * 60 * 1000);
    });
  });

  describe('Redis Configuration', () => {
    it('should have default Redis settings', () => {
      const config = ConfigService.getInstance();
      const redisConfig = config.getRedisConfig();

      expect(redisConfig.host).toBe('localhost');
      expect(redisConfig.port).toBe(6379);
      expect(redisConfig.db).toBe(0);
    });

    it('should have key prefix', () => {
      const config = ConfigService.getInstance();
      const redisConfig = config.getRedisConfig();

      expect(redisConfig.keyPrefix).toBe('freshroute:');
    });
  });

  describe('Storage Configuration', () => {
    it('should default to local storage', () => {
      const config = ConfigService.getInstance();
      const storageConfig = config.getStorageConfig();

      expect(storageConfig.provider).toBe('local');
    });

    it('should have local storage path', () => {
      const config = ConfigService.getInstance();
      const storageConfig = config.getStorageConfig();

      expect(storageConfig.localStoragePath).toBe('./uploads');
    });
  });

  describe('Logging Configuration', () => {
    it('should have debug level in development', () => {
      process.env.NODE_ENV = 'development';
      const config = ConfigService.getInstance();
      const loggingConfig = config.getLoggingConfig();

      expect(loggingConfig.level).toBe('debug');
    });

    it('should have error level in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.DB_SSL = 'true';
      const config = ConfigService.getInstance();
      const loggingConfig = config.getLoggingConfig();

      expect(loggingConfig.level).toBe('error');
    });
  });

  describe('Payment Configuration', () => {
    it('should default to mock payment provider', () => {
      const config = ConfigService.getInstance();
      const paymentConfig = config.getPaymentConfig();

      expect(paymentConfig.provider).toBe('mock');
    });
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const config1 = ConfigService.getInstance();
      const config2 = ConfigService.getInstance();

      expect(config1).toBe(config2);
    });
  });

  describe('Configuration Summary', () => {
    it('should print configuration summary without errors', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const config = ConfigService.getInstance();

      config.printConfigSummary();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
