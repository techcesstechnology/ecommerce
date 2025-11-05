/**
 * Environment Type Definitions for FreshRoute
 * Defines all configuration interfaces and types used throughout the application
 */

/**
 * Supported environment types
 */
export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
  STAGING = 'staging',
}

/**
 * Database configuration interface
 */
export interface DatabaseConfig {
  host: string;
  port: number;
  name: string;
  user: string;
  password: string;
  sync: boolean;
  logging: boolean;
  ssl: boolean;
  poolMin: number;
  poolMax: number;
  connectionTimeout: number;
  idleTimeout: number;
}

/**
 * JWT configuration interface
 */
export interface JWTConfig {
  secret: string;
  expiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
  issuer: string;
  audience: string;
}

/**
 * API configuration interface
 */
export interface APIConfig {
  port: number;
  host: string;
  prefix: string;
  version: string;
  bodyLimit: string;
  trustProxy: boolean;
}

/**
 * Rate limiting configuration interface
 */
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  loginWindowMs: number;
  loginMaxRequests: number;
  registerWindowMs: number;
  registerMaxRequests: number;
  passwordResetWindowMs: number;
  passwordResetMaxRequests: number;
}

/**
 * CORS configuration interface
 */
export interface CORSConfig {
  origins: string[];
  credentials: boolean;
  allowedMethods: string[];
  allowedHeaders: string[];
}

/**
 * Redis configuration interface
 */
export interface RedisConfig {
  host: string;
  port: number;
  password: string;
  db: number;
  keyPrefix: string;
  ttl: number;
}

/**
 * Security configuration interface
 */
export interface SecurityConfig {
  bcryptRounds: number;
  passwordMinLength: number;
  sessionTimeout: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  csrfProtection: boolean;
}

/**
 * Business settings configuration interface
 */
export interface BusinessConfig {
  taxRate: number;
  currency: string;
  currencySymbol: string;
  shippingFeeBase: number;
  shippingFeePerKm: number;
  freeShippingThreshold: number;
  minOrderAmount: number;
  maxOrderAmount: number;
  orderCancellationWindow: number;
}

/**
 * Email configuration interface
 */
export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
  fromName: string;
}

/**
 * Cloud storage configuration interface (AWS S3)
 */
export interface StorageConfig {
  provider: 'local' | 'aws' | 'azure' | 'gcp';
  awsAccessKeyId: string;
  awsSecretAccessKey: string;
  awsRegion: string;
  s3BucketName: string;
  localStoragePath: string;
}

/**
 * Logging configuration interface
 */
export interface LoggingConfig {
  level: 'error' | 'warn' | 'info' | 'debug' | 'verbose';
  format: 'json' | 'text';
  directory: string;
  maxFiles: number;
  maxSize: string;
}

/**
 * Payment configuration interface
 */
export interface PaymentConfig {
  provider: 'stripe' | 'paypal' | 'mock';
  apiKey: string;
  apiSecret: string;
  webhookSecret: string;
  currency: string;
}

/**
 * APM (Application Performance Monitoring) configuration interface
 */
export interface ApmConfig {
  enabled: boolean;
  serviceName: string;
  environment: string;
  version: string;
  apiKey: string;
  samplingRate: number;
  tags: Record<string, string>;
}

/**
 * Sentry error tracking configuration interface
 */
export interface SentryConfig {
  enabled: boolean;
  dsn: string;
  environment: string;
  release: string;
  tracesSampleRate: number;
  profilesSampleRate: number;
  allowUrls: string[];
  ignoreErrors: string[];
  beforeSend?: boolean;
}

/**
 * Analytics configuration interface
 */
export interface AnalyticsConfig {
  enabled: boolean;
  provider: 'segment' | 'mixpanel' | 'amplitude' | 'mock';
  apiKey: string;
  trackPageViews: boolean;
  trackErrors: boolean;
}

/**
 * Monitoring configuration interface (combines all monitoring services)
 */
export interface MonitoringConfig {
  apm: ApmConfig;
  sentry: SentryConfig;
  analytics: AnalyticsConfig;
}

/**
 * Complete application configuration interface
 */
export interface AppConfig {
  env: Environment;
  nodeEnv: string;
  isProduction: boolean;
  isDevelopment: boolean;
  isTest: boolean;
  database: DatabaseConfig;
  jwt: JWTConfig;
  api: APIConfig;
  rateLimit: RateLimitConfig;
  cors: CORSConfig;
  redis: RedisConfig;
  security: SecurityConfig;
  business: BusinessConfig;
  email: EmailConfig;
  storage: StorageConfig;
  logging: LoggingConfig;
  payment: PaymentConfig;
  monitoring: MonitoringConfig;
}

/**
 * Environment variable keys
 */
export const ENV_KEYS = {
  NODE_ENV: 'NODE_ENV',

  // Database
  DB_HOST: 'DB_HOST',
  DB_PORT: 'DB_PORT',
  DB_NAME: 'DB_NAME',
  DB_USER: 'DB_USER',
  DB_PASSWORD: 'DB_PASSWORD',
  DB_SYNC: 'DB_SYNC',
  DB_LOGGING: 'DB_LOGGING',
  DB_SSL: 'DB_SSL',
  DB_POOL_MIN: 'DB_POOL_MIN',
  DB_POOL_MAX: 'DB_POOL_MAX',

  // JWT
  JWT_SECRET: 'JWT_SECRET',
  JWT_EXPIRES_IN: 'JWT_EXPIRES_IN',
  JWT_REFRESH_SECRET: 'JWT_REFRESH_SECRET',
  JWT_REFRESH_EXPIRES_IN: 'JWT_REFRESH_EXPIRES_IN',
  JWT_ISSUER: 'JWT_ISSUER',
  JWT_AUDIENCE: 'JWT_AUDIENCE',

  // API
  BACKEND_PORT: 'BACKEND_PORT',
  BACKEND_HOST: 'BACKEND_HOST',
  API_PREFIX: 'API_PREFIX',
  API_VERSION: 'API_VERSION',

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: 'RATE_LIMIT_WINDOW_MS',
  RATE_LIMIT_MAX_REQUESTS: 'RATE_LIMIT_MAX_REQUESTS',

  // CORS
  CORS_ORIGIN: 'CORS_ORIGIN',

  // Redis
  REDIS_HOST: 'REDIS_HOST',
  REDIS_PORT: 'REDIS_PORT',
  REDIS_PASSWORD: 'REDIS_PASSWORD',
  REDIS_DB: 'REDIS_DB',

  // Security
  BCRYPT_ROUNDS: 'BCRYPT_ROUNDS',
  PASSWORD_MIN_LENGTH: 'PASSWORD_MIN_LENGTH',

  // Business
  TAX_RATE: 'TAX_RATE',
  CURRENCY: 'CURRENCY',
  CURRENCY_SYMBOL: 'CURRENCY_SYMBOL',
  SHIPPING_FEE_BASE: 'SHIPPING_FEE_BASE',
  SHIPPING_FEE_PER_KM: 'SHIPPING_FEE_PER_KM',
  FREE_SHIPPING_THRESHOLD: 'FREE_SHIPPING_THRESHOLD',
  MIN_ORDER_AMOUNT: 'MIN_ORDER_AMOUNT',
  MAX_ORDER_AMOUNT: 'MAX_ORDER_AMOUNT',

  // Email
  EMAIL_HOST: 'EMAIL_HOST',
  EMAIL_PORT: 'EMAIL_PORT',
  EMAIL_SECURE: 'EMAIL_SECURE',
  EMAIL_USER: 'EMAIL_USER',
  EMAIL_PASSWORD: 'EMAIL_PASSWORD',
  EMAIL_FROM: 'EMAIL_FROM',
  EMAIL_FROM_NAME: 'EMAIL_FROM_NAME',

  // Storage
  STORAGE_PROVIDER: 'STORAGE_PROVIDER',
  AWS_ACCESS_KEY_ID: 'AWS_ACCESS_KEY_ID',
  AWS_SECRET_ACCESS_KEY: 'AWS_SECRET_ACCESS_KEY',
  AWS_REGION: 'AWS_REGION',
  S3_BUCKET_NAME: 'S3_BUCKET_NAME',
  LOCAL_STORAGE_PATH: 'LOCAL_STORAGE_PATH',

  // Logging
  LOG_LEVEL: 'LOG_LEVEL',
  LOG_FORMAT: 'LOG_FORMAT',
  LOG_DIRECTORY: 'LOG_DIRECTORY',

  // Payment
  PAYMENT_PROVIDER: 'PAYMENT_PROVIDER',
  PAYMENT_API_KEY: 'PAYMENT_API_KEY',
  PAYMENT_API_SECRET: 'PAYMENT_API_SECRET',
  PAYMENT_WEBHOOK_SECRET: 'PAYMENT_WEBHOOK_SECRET',

  // APM Monitoring
  APM_ENABLED: 'APM_ENABLED',
  APM_SERVICE_NAME: 'APM_SERVICE_NAME',
  APM_API_KEY: 'APM_API_KEY',
  APM_SAMPLING_RATE: 'APM_SAMPLING_RATE',

  // Sentry Error Tracking
  SENTRY_ENABLED: 'SENTRY_ENABLED',
  SENTRY_DSN: 'SENTRY_DSN',
  SENTRY_TRACES_SAMPLE_RATE: 'SENTRY_TRACES_SAMPLE_RATE',
  SENTRY_PROFILES_SAMPLE_RATE: 'SENTRY_PROFILES_SAMPLE_RATE',

  // Analytics
  ANALYTICS_ENABLED: 'ANALYTICS_ENABLED',
  ANALYTICS_PROVIDER: 'ANALYTICS_PROVIDER',
  ANALYTICS_API_KEY: 'ANALYTICS_API_KEY',
} as const;
