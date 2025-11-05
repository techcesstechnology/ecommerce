/**
 * Configuration Service
 * Central service for accessing all application configuration
 */

import dotenv from 'dotenv';
import path from 'path';
import {
  AppConfig,
  Environment,
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
  MonitoringConfig,
  ApmConfig,
  SentryConfig,
  AnalyticsConfig,
  ENV_KEYS,
} from './env.types';
import {
  validateConfig,
  parseBoolean,
  parseInteger,
  parseFloat,
  parseArray,
  getRequiredEnv,
  getOptionalEnv,
} from './config.validator';

/**
 * Configuration Service Class
 * Singleton service that provides access to all application configuration
 */
class ConfigService {
  private static instance: ConfigService;
  private config: AppConfig;
  private initialized = false;

  private constructor() {
    // Don't initialize immediately - wait for getInstance to be called
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
      ConfigService.instance.initialize();
    }
    return ConfigService.instance;
  }

  /**
   * Initialize the configuration
   */
  private initialize(): void {
    if (this.initialized) {
      return;
    }

    // Load environment variables
    this.loadEnvironmentVariables();

    // Validate configuration
    validateConfig();

    // Build configuration object
    this.config = this.buildConfig();
    this.initialized = true;
  }

  /**
   * Reset singleton instance (for testing)
   */
  public static resetInstance(): void {
    ConfigService.instance = undefined as any;
  }

  /**
   * Load environment variables from .env file
   */
  private loadEnvironmentVariables(): void {
    // Try multiple possible .env file locations
    const envPaths = [
      path.join(__dirname, '../../../.env'),
      path.join(process.cwd(), '.env'),
      path.join(__dirname, '../../.env'),
    ];

    let loaded = false;
    for (const envPath of envPaths) {
      const result = dotenv.config({ path: envPath });
      if (!result.error) {
        console.log(`✅ Loaded environment variables from: ${envPath}`);
        loaded = true;
        break;
      }
    }

    if (!loaded) {
      console.warn('⚠️  No .env file found. Using environment variables from system.');
    }
  }

  /**
   * Build complete configuration object
   */
  private buildConfig(): AppConfig {
    const nodeEnv = getOptionalEnv(ENV_KEYS.NODE_ENV, Environment.DEVELOPMENT);
    const env = nodeEnv as Environment;

    return {
      env,
      nodeEnv,
      isProduction: env === Environment.PRODUCTION,
      isDevelopment: env === Environment.DEVELOPMENT,
      isTest: env === Environment.TEST,
      database: this.buildDatabaseConfig(env),
      jwt: this.buildJWTConfig(),
      api: this.buildAPIConfig(),
      rateLimit: this.buildRateLimitConfig(),
      cors: this.buildCORSConfig(env),
      redis: this.buildRedisConfig(),
      security: this.buildSecurityConfig(),
      business: this.buildBusinessConfig(),
      email: this.buildEmailConfig(),
      storage: this.buildStorageConfig(),
      logging: this.buildLoggingConfig(env),
      payment: this.buildPaymentConfig(),
      monitoring: this.buildMonitoringConfig(env),
    };
  }

  /**
   * Build database configuration
   */
  private buildDatabaseConfig(env: Environment): DatabaseConfig {
    return {
      host: getRequiredEnv(ENV_KEYS.DB_HOST),
      port: parseInteger(process.env[ENV_KEYS.DB_PORT], 5432),
      name: getRequiredEnv(ENV_KEYS.DB_NAME),
      user: getRequiredEnv(ENV_KEYS.DB_USER),
      password: getOptionalEnv(ENV_KEYS.DB_PASSWORD, ''),
      sync: parseBoolean(process.env[ENV_KEYS.DB_SYNC], env === Environment.DEVELOPMENT),
      logging: parseBoolean(process.env[ENV_KEYS.DB_LOGGING], env === Environment.DEVELOPMENT),
      ssl: parseBoolean(process.env[ENV_KEYS.DB_SSL], env === Environment.PRODUCTION),
      poolMin: parseInteger(process.env[ENV_KEYS.DB_POOL_MIN], 2),
      poolMax: parseInteger(process.env[ENV_KEYS.DB_POOL_MAX], 10),
      connectionTimeout: 2000,
      idleTimeout: 30000,
    };
  }

  /**
   * Build JWT configuration
   */
  private buildJWTConfig(): JWTConfig {
    return {
      secret: getRequiredEnv(ENV_KEYS.JWT_SECRET),
      expiresIn: getOptionalEnv(ENV_KEYS.JWT_EXPIRES_IN, '15m'),
      refreshSecret: getRequiredEnv(ENV_KEYS.JWT_REFRESH_SECRET),
      refreshExpiresIn: getOptionalEnv(ENV_KEYS.JWT_REFRESH_EXPIRES_IN, '7d'),
      issuer: getOptionalEnv(ENV_KEYS.JWT_ISSUER, 'freshroute'),
      audience: getOptionalEnv(ENV_KEYS.JWT_AUDIENCE, 'freshroute-users'),
    };
  }

  /**
   * Build API configuration
   */
  private buildAPIConfig(): APIConfig {
    return {
      port: parseInteger(process.env[ENV_KEYS.BACKEND_PORT], 5000),
      host: getOptionalEnv(ENV_KEYS.BACKEND_HOST, 'localhost'),
      prefix: getOptionalEnv(ENV_KEYS.API_PREFIX, '/api'),
      version: getOptionalEnv(ENV_KEYS.API_VERSION, 'v1'),
      bodyLimit: '10kb',
      trustProxy: true,
    };
  }

  /**
   * Build rate limit configuration
   */
  private buildRateLimitConfig(): RateLimitConfig {
    return {
      windowMs: parseInteger(process.env[ENV_KEYS.RATE_LIMIT_WINDOW_MS], 15 * 60 * 1000), // 15 minutes
      maxRequests: parseInteger(process.env[ENV_KEYS.RATE_LIMIT_MAX_REQUESTS], 100),
      loginWindowMs: 15 * 60 * 1000, // 15 minutes
      loginMaxRequests: 5,
      registerWindowMs: 60 * 60 * 1000, // 1 hour
      registerMaxRequests: 3,
      passwordResetWindowMs: 60 * 60 * 1000, // 1 hour
      passwordResetMaxRequests: 3,
    };
  }

  /**
   * Build CORS configuration
   */
  private buildCORSConfig(env: Environment): CORSConfig {
    const corsOrigin = getOptionalEnv(ENV_KEYS.CORS_ORIGIN, '');
    let origins: string[];

    if (corsOrigin) {
      // Use provided origins from environment
      origins = parseArray(corsOrigin, []);
    } else if (env === Environment.PRODUCTION) {
      // In production, require explicit CORS configuration
      console.warn('⚠️  CORS_ORIGIN not set in production. CORS will be very restrictive.');
      origins = [];
    } else {
      // Default origins for development
      origins = ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:19006'];
    }

    return {
      origins,
      credentials: true,
      allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    };
  }

  /**
   * Build Redis configuration
   */
  private buildRedisConfig(): RedisConfig {
    return {
      host: getOptionalEnv(ENV_KEYS.REDIS_HOST, 'localhost'),
      port: parseInteger(process.env[ENV_KEYS.REDIS_PORT], 6379),
      password: getOptionalEnv(ENV_KEYS.REDIS_PASSWORD, ''),
      db: parseInteger(process.env[ENV_KEYS.REDIS_DB], 0),
      keyPrefix: 'freshroute:',
      ttl: 3600, // 1 hour default TTL
    };
  }

  /**
   * Build security configuration
   */
  private buildSecurityConfig(): SecurityConfig {
    return {
      bcryptRounds: parseInteger(process.env[ENV_KEYS.BCRYPT_ROUNDS], 12),
      passwordMinLength: parseInteger(process.env[ENV_KEYS.PASSWORD_MIN_LENGTH], 8),
      sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
      maxLoginAttempts: 5,
      lockoutDuration: 15 * 60 * 1000, // 15 minutes
      csrfProtection: false, // Not needed for JWT-based API
    };
  }

  /**
   * Build business configuration
   */
  private buildBusinessConfig(): BusinessConfig {
    return {
      taxRate: parseFloat(process.env[ENV_KEYS.TAX_RATE], 0.15), // 15% default
      currency: getOptionalEnv(ENV_KEYS.CURRENCY, 'USD'),
      currencySymbol: getOptionalEnv(ENV_KEYS.CURRENCY_SYMBOL, '$'),
      shippingFeeBase: parseFloat(process.env[ENV_KEYS.SHIPPING_FEE_BASE], 5.0),
      shippingFeePerKm: parseFloat(process.env[ENV_KEYS.SHIPPING_FEE_PER_KM], 0.5),
      freeShippingThreshold: parseFloat(process.env[ENV_KEYS.FREE_SHIPPING_THRESHOLD], 50.0),
      minOrderAmount: parseFloat(process.env[ENV_KEYS.MIN_ORDER_AMOUNT], 10.0),
      maxOrderAmount: parseFloat(process.env[ENV_KEYS.MAX_ORDER_AMOUNT], 10000.0),
      orderCancellationWindow: 30 * 60 * 1000, // 30 minutes
    };
  }

  /**
   * Build email configuration
   */
  private buildEmailConfig(): EmailConfig {
    return {
      host: getOptionalEnv(ENV_KEYS.EMAIL_HOST, ''),
      port: parseInteger(process.env[ENV_KEYS.EMAIL_PORT], 587),
      secure: parseBoolean(process.env[ENV_KEYS.EMAIL_SECURE], false),
      user: getOptionalEnv(ENV_KEYS.EMAIL_USER, ''),
      password: getOptionalEnv(ENV_KEYS.EMAIL_PASSWORD, ''),
      from: getOptionalEnv(ENV_KEYS.EMAIL_FROM, 'noreply@freshroute.com'),
      fromName: getOptionalEnv(ENV_KEYS.EMAIL_FROM_NAME, 'FreshRoute'),
    };
  }

  /**
   * Build storage configuration
   */
  private buildStorageConfig(): StorageConfig {
    const provider = getOptionalEnv(
      ENV_KEYS.STORAGE_PROVIDER,
      'local'
    ) as StorageConfig['provider'];

    return {
      provider,
      awsAccessKeyId: getOptionalEnv(ENV_KEYS.AWS_ACCESS_KEY_ID, ''),
      awsSecretAccessKey: getOptionalEnv(ENV_KEYS.AWS_SECRET_ACCESS_KEY, ''),
      awsRegion: getOptionalEnv(ENV_KEYS.AWS_REGION, 'us-east-1'),
      s3BucketName: getOptionalEnv(ENV_KEYS.S3_BUCKET_NAME, ''),
      localStoragePath: getOptionalEnv(ENV_KEYS.LOCAL_STORAGE_PATH, './uploads'),
    };
  }

  /**
   * Build logging configuration
   */
  private buildLoggingConfig(env: Environment): LoggingConfig {
    const defaultLevel = env === Environment.PRODUCTION ? 'error' : 'debug';

    return {
      level: getOptionalEnv(ENV_KEYS.LOG_LEVEL, defaultLevel) as LoggingConfig['level'],
      format: getOptionalEnv(ENV_KEYS.LOG_FORMAT, 'json') as LoggingConfig['format'],
      directory: getOptionalEnv(ENV_KEYS.LOG_DIRECTORY, './logs'),
      maxFiles: 14, // Keep logs for 14 days
      maxSize: '20m', // Max 20MB per file
    };
  }

  /**
   * Build payment configuration
   */
  private buildPaymentConfig(): PaymentConfig {
    const provider = getOptionalEnv(ENV_KEYS.PAYMENT_PROVIDER, 'mock') as PaymentConfig['provider'];

    return {
      provider,
      apiKey: getOptionalEnv(ENV_KEYS.PAYMENT_API_KEY, ''),
      apiSecret: getOptionalEnv(ENV_KEYS.PAYMENT_API_SECRET, ''),
      webhookSecret: getOptionalEnv(ENV_KEYS.PAYMENT_WEBHOOK_SECRET, ''),
      currency: getOptionalEnv(ENV_KEYS.CURRENCY, 'USD'),
    };
  }

  /**
   * Build APM configuration
   */
  private buildApmConfig(env: Environment): ApmConfig {
    const apiConfig = this.buildAPIConfig();
    
    return {
      enabled: parseBoolean(process.env[ENV_KEYS.APM_ENABLED], false),
      serviceName: getOptionalEnv(ENV_KEYS.APM_SERVICE_NAME, 'freshroute-backend'),
      environment: env,
      version: apiConfig.version,
      apiKey: getOptionalEnv(ENV_KEYS.APM_API_KEY, ''),
      samplingRate: parseFloat(process.env[ENV_KEYS.APM_SAMPLING_RATE], 0.1),
      tags: {
        service: 'backend',
        platform: 'node',
      },
    };
  }

  /**
   * Build Sentry configuration
   */
  private buildSentryConfig(env: Environment): SentryConfig {
    const apiConfig = this.buildAPIConfig();
    
    return {
      enabled: parseBoolean(process.env[ENV_KEYS.SENTRY_ENABLED], false),
      dsn: getOptionalEnv(ENV_KEYS.SENTRY_DSN, ''),
      environment: env,
      release: `freshroute-backend@${apiConfig.version}`,
      tracesSampleRate: parseFloat(process.env[ENV_KEYS.SENTRY_TRACES_SAMPLE_RATE], 0.1),
      profilesSampleRate: parseFloat(process.env[ENV_KEYS.SENTRY_PROFILES_SAMPLE_RATE], 0.1),
      allowUrls: [],
      ignoreErrors: [
        'ValidationError',
        'UnauthorizedError',
        'ForbiddenError',
        'NotFoundError',
      ],
    };
  }

  /**
   * Build Analytics configuration
   */
  private buildAnalyticsConfig(): AnalyticsConfig {
    const provider = getOptionalEnv(
      ENV_KEYS.ANALYTICS_PROVIDER,
      'mock'
    ) as AnalyticsConfig['provider'];

    return {
      enabled: parseBoolean(process.env[ENV_KEYS.ANALYTICS_ENABLED], false),
      provider,
      apiKey: getOptionalEnv(ENV_KEYS.ANALYTICS_API_KEY, ''),
      trackPageViews: true,
      trackErrors: true,
    };
  }

  /**
   * Build monitoring configuration
   */
  private buildMonitoringConfig(env: Environment): MonitoringConfig {
    return {
      apm: this.buildApmConfig(env),
      sentry: this.buildSentryConfig(env),
      analytics: this.buildAnalyticsConfig(),
    };
  }

  /**
   * Get the complete configuration
   */
  public getConfig(): Readonly<AppConfig> {
    return Object.freeze({ ...this.config });
  }

  /**
   * Get database configuration
   */
  public getDatabaseConfig(): Readonly<DatabaseConfig> {
    return Object.freeze({ ...this.config.database });
  }

  /**
   * Get JWT configuration
   */
  public getJWTConfig(): Readonly<JWTConfig> {
    return Object.freeze({ ...this.config.jwt });
  }

  /**
   * Get API configuration
   */
  public getAPIConfig(): Readonly<APIConfig> {
    return Object.freeze({ ...this.config.api });
  }

  /**
   * Get rate limit configuration
   */
  public getRateLimitConfig(): Readonly<RateLimitConfig> {
    return Object.freeze({ ...this.config.rateLimit });
  }

  /**
   * Get CORS configuration
   */
  public getCORSConfig(): Readonly<CORSConfig> {
    return Object.freeze({ ...this.config.cors });
  }

  /**
   * Get Redis configuration
   */
  public getRedisConfig(): Readonly<RedisConfig> {
    return Object.freeze({ ...this.config.redis });
  }

  /**
   * Get security configuration
   */
  public getSecurityConfig(): Readonly<SecurityConfig> {
    return Object.freeze({ ...this.config.security });
  }

  /**
   * Get business configuration
   */
  public getBusinessConfig(): Readonly<BusinessConfig> {
    return Object.freeze({ ...this.config.business });
  }

  /**
   * Get email configuration
   */
  public getEmailConfig(): Readonly<EmailConfig> {
    return Object.freeze({ ...this.config.email });
  }

  /**
   * Get storage configuration
   */
  public getStorageConfig(): Readonly<StorageConfig> {
    return Object.freeze({ ...this.config.storage });
  }

  /**
   * Get logging configuration
   */
  public getLoggingConfig(): Readonly<LoggingConfig> {
    return Object.freeze({ ...this.config.logging });
  }

  /**
   * Get payment configuration
   */
  public getPaymentConfig(): Readonly<PaymentConfig> {
    return Object.freeze({ ...this.config.payment });
  }

  /**
   * Get monitoring configuration
   */
  public getMonitoringConfig(): Readonly<MonitoringConfig> {
    return Object.freeze({
      apm: { ...this.config.monitoring.apm },
      sentry: { ...this.config.monitoring.sentry },
      analytics: { ...this.config.monitoring.analytics },
    });
  }

  /**
   * Get APM configuration
   */
  public getApmConfig(): Readonly<ApmConfig> {
    return Object.freeze({ ...this.config.monitoring.apm });
  }

  /**
   * Get Sentry configuration
   */
  public getSentryConfig(): Readonly<SentryConfig> {
    return Object.freeze({ ...this.config.monitoring.sentry });
  }

  /**
   * Get Analytics configuration
   */
  public getAnalyticsConfig(): Readonly<AnalyticsConfig> {
    return Object.freeze({ ...this.config.monitoring.analytics });
  }

  /**
   * Check if running in production
   */
  public isProduction(): boolean {
    return this.config.isProduction;
  }

  /**
   * Check if running in development
   */
  public isDevelopment(): boolean {
    return this.config.isDevelopment;
  }

  /**
   * Check if running in test mode
   */
  public isTest(): boolean {
    return this.config.isTest;
  }

  /**
   * Get current environment
   */
  public getEnvironment(): Environment {
    return this.config.env;
  }

  /**
   * Check if configuration is initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Print configuration summary (without sensitive data)
   */
  public printConfigSummary(): void {
    console.log('\n📋 Configuration Summary:');
    console.log('═══════════════════════════════════════');
    console.log(`Environment: ${this.config.env}`);
    console.log(`API Port: ${this.config.api.port}`);
    console.log(`API Host: ${this.config.api.host}`);
    console.log(
      `Database: ${this.config.database.host}:${this.config.database.port}/${this.config.database.name}`
    );
    console.log(`Redis: ${this.config.redis.host}:${this.config.redis.port}`);
    console.log(`CORS Origins: ${this.config.cors.origins.join(', ')}`);
    console.log(
      `Rate Limit: ${this.config.rateLimit.maxRequests} requests per ${this.config.rateLimit.windowMs / 1000}s`
    );
    console.log(
      `Currency: ${this.config.business.currency} (${this.config.business.currencySymbol})`
    );
    console.log(`Tax Rate: ${(this.config.business.taxRate * 100).toFixed(1)}%`);
    console.log(`Storage Provider: ${this.config.storage.provider}`);
    console.log(`Payment Provider: ${this.config.payment.provider}`);
    console.log(`Log Level: ${this.config.logging.level}`);
    console.log('═══════════════════════════════════════\n');
  }
}

// Export singleton getter function instead of instance
export function getConfig(): ConfigService {
  return ConfigService.getInstance();
}

// Deprecated: Export singleton instance for backward compatibility
// This will be removed in a future version - use getConfig() instead
export const config = {
  get instance() {
    console.warn('⚠️  config.instance is deprecated. Please use getConfig() instead.');
    return ConfigService.getInstance();
  },
};

// Export class for testing
export { ConfigService };
