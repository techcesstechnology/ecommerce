# FreshRoute Configuration System

## Overview

The FreshRoute platform uses a comprehensive, type-safe configuration system that validates all environment variables and provides easy access to configuration settings throughout the application.

## Features

- ✅ **Type-safe configuration** with full TypeScript support
- ✅ **Comprehensive validation** ensures all required variables are present
- ✅ **Environment-specific defaults** for development, production, and test
- ✅ **Centralized access** via singleton pattern
- ✅ **Security validation** for JWT secrets and database passwords
- ✅ **Business settings** for tax rates, shipping, and currency
- ✅ **Flexible configuration** supports multiple storage and payment providers

## Quick Start

### 1. Set up environment variables

```bash
# Copy the example file
cp .env.example .env

# Edit the .env file with your configuration
nano .env
```

### 2. Required Variables

The following variables are **required** for the application to start:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=freshroute_db
DB_USER=postgres

# JWT (must be at least 32 characters and different from each other)
JWT_SECRET=your_jwt_secret_key_here_change_in_production_min_32_chars
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here_change_in_production_min_32_chars
```

### 3. Production Additional Requirements

In production, these additional variables are required:

```env
DB_PASSWORD=secure_database_password
DB_SSL=true
```

## Usage

### Basic Usage

```typescript
import { getConfig } from './config';

// Get the configuration service instance
const config = getConfig();

// Check environment
if (config.isProduction()) {
  console.log('Running in production mode');
}

// Get specific configuration sections
const dbConfig = config.getDatabaseConfig();
const jwtConfig = config.getJWTConfig();
const apiConfig = config.getAPIConfig();

// Access configuration values
console.log(`Database: ${dbConfig.host}:${dbConfig.port}`);
console.log(`JWT expires in: ${jwtConfig.expiresIn}`);
console.log(`API port: ${apiConfig.port}`);
```

### Configuration Sections

The configuration system provides getters for all major sections:

```typescript
// Database configuration
const dbConfig = config.getDatabaseConfig();
console.log(dbConfig.host, dbConfig.port, dbConfig.name);

// JWT & Authentication
const jwtConfig = config.getJWTConfig();
console.log(jwtConfig.secret, jwtConfig.expiresIn);

// API Server
const apiConfig = config.getAPIConfig();
console.log(apiConfig.port, apiConfig.host);

// Rate Limiting
const rateLimitConfig = config.getRateLimitConfig();
console.log(rateLimitConfig.maxRequests, rateLimitConfig.windowMs);

// CORS
const corsConfig = config.getCORSConfig();
console.log(corsConfig.origins);

// Redis
const redisConfig = config.getRedisConfig();
console.log(redisConfig.host, redisConfig.port);

// Security
const securityConfig = config.getSecurityConfig();
console.log(securityConfig.bcryptRounds, securityConfig.passwordMinLength);

// Business Settings
const businessConfig = config.getBusinessConfig();
console.log(businessConfig.taxRate, businessConfig.currency);

// Email
const emailConfig = config.getEmailConfig();
console.log(emailConfig.host, emailConfig.from);

// Storage
const storageConfig = config.getStorageConfig();
console.log(storageConfig.provider, storageConfig.localStoragePath);

// Logging
const loggingConfig = config.getLoggingConfig();
console.log(loggingConfig.level, loggingConfig.format);

// Payment
const paymentConfig = config.getPaymentConfig();
console.log(paymentConfig.provider, paymentConfig.currency);
```

## Environment Variables Reference

### Application Environment

```env
NODE_ENV=development  # Options: development, production, test, staging
```

### API Server Configuration

```env
BACKEND_PORT=5000           # API server port (default: 5000)
BACKEND_HOST=localhost      # API server host (default: localhost)
API_PREFIX=/api             # API route prefix (default: /api)
API_VERSION=v1              # API version (default: v1)
```

### Database Configuration (PostgreSQL)

```env
DB_HOST=localhost           # Database host
DB_PORT=5432               # Database port (default: 5432)
DB_NAME=freshroute_db      # Database name
DB_USER=postgres           # Database user
DB_PASSWORD=password       # Database password (required in production)

# Connection Pool
DB_POOL_MIN=2              # Minimum connections (default: 2)
DB_POOL_MAX=10             # Maximum connections (default: 10)

# Options
DB_SYNC=false              # Auto-sync schema (default: true in dev, false in prod)
DB_LOGGING=false           # Enable SQL logging (default: true in dev, false in prod)
DB_SSL=false               # Enable SSL (default: false in dev, true in prod)
```

### JWT & Authentication

```env
# IMPORTANT: Use strong, unique secrets (minimum 32 characters)
# Generate with: openssl rand -base64 32

JWT_SECRET=your_secret_here                    # Access token secret
JWT_EXPIRES_IN=15m                             # Access token expiry (default: 15m)
JWT_REFRESH_SECRET=your_refresh_secret_here    # Refresh token secret
JWT_REFRESH_EXPIRES_IN=7d                      # Refresh token expiry (default: 7d)
JWT_ISSUER=freshroute                          # Token issuer (default: freshroute)
JWT_AUDIENCE=freshroute-users                  # Token audience (default: freshroute-users)
```

### Security Configuration

```env
BCRYPT_ROUNDS=12           # Bcrypt hashing rounds (default: 12)
PASSWORD_MIN_LENGTH=8      # Minimum password length (default: 8)
```

### Rate Limiting

```env
RATE_LIMIT_WINDOW_MS=900000      # Window in milliseconds (default: 15 minutes)
RATE_LIMIT_MAX_REQUESTS=100      # Max requests per window (default: 100)
```

### CORS Configuration

```env
# Comma-separated list of allowed origins
CORS_ORIGIN=http://localhost:3000,http://localhost:5000,http://localhost:19006
```

### Business Settings

```env
# Tax Configuration
TAX_RATE=0.15                      # Tax rate as decimal (e.g., 0.15 = 15%)

# Currency
CURRENCY=USD                       # Currency code (default: USD)
CURRENCY_SYMBOL=$                  # Currency symbol (default: $)

# Shipping
SHIPPING_FEE_BASE=5.00            # Base shipping fee (default: 5.00)
SHIPPING_FEE_PER_KM=0.50          # Per-kilometer fee (default: 0.50)
FREE_SHIPPING_THRESHOLD=50.00     # Free shipping above this amount (default: 50.00)

# Order Limits
MIN_ORDER_AMOUNT=10.00            # Minimum order amount (default: 10.00)
MAX_ORDER_AMOUNT=10000.00         # Maximum order amount (default: 10000.00)
```

### Redis Configuration

```env
REDIS_HOST=localhost       # Redis host (default: localhost)
REDIS_PORT=6379           # Redis port (default: 6379)
REDIS_PASSWORD=           # Redis password (optional)
REDIS_DB=0                # Redis database number (default: 0)
```

### Email Configuration

```env
EMAIL_HOST=smtp.gmail.com         # SMTP host
EMAIL_PORT=587                    # SMTP port (default: 587)
EMAIL_SECURE=false                # Use TLS (default: false)
EMAIL_USER=                       # SMTP username
EMAIL_PASSWORD=                   # SMTP password
EMAIL_FROM=noreply@freshroute.com # From address (default: noreply@freshroute.com)
EMAIL_FROM_NAME=FreshRoute        # From name (default: FreshRoute)
```

### Cloud Storage Configuration

```env
# Storage Provider
STORAGE_PROVIDER=local    # Options: local, aws, azure, gcp (default: local)
LOCAL_STORAGE_PATH=./uploads  # Local storage path (default: ./uploads)

# AWS S3 (if using AWS)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
S3_BUCKET_NAME=
```

### Payment Gateway Configuration

```env
PAYMENT_PROVIDER=mock     # Options: stripe, paypal, mock (default: mock)
PAYMENT_API_KEY=
PAYMENT_API_SECRET=
PAYMENT_WEBHOOK_SECRET=
```

### Logging Configuration

```env
LOG_LEVEL=debug           # Options: error, warn, info, debug, verbose (default: debug in dev, error in prod)
LOG_FORMAT=json           # Options: json, text (default: json)
LOG_DIRECTORY=./logs      # Log directory (default: ./logs)
```

## Validation

The configuration system performs comprehensive validation:

### Required Variables Validation
- Ensures all required environment variables are present
- Different requirements for development vs. production

### JWT Secrets Validation
- Verifies JWT secrets are at least 32 characters long
- Ensures access and refresh secrets are different

### Database Validation
- Validates port numbers are in valid range (1-65535)
- Requires strong passwords (8+ characters) in production

### Business Configuration Validation
- Tax rate must be between 0 and 1
- Shipping fees must be positive numbers

### Rate Limiting Validation
- Window must be at least 1000ms (1 second)
- Max requests must be positive

## Environment-Specific Defaults

### Development

```typescript
{
  logging: { level: 'debug', format: 'text' },
  security: { bcryptRounds: 10 },
  database: { sync: true, logging: true },
  rateLimit: { maxRequests: 1000 },
}
```

### Production

```typescript
{
  logging: { level: 'error', format: 'json' },
  security: { bcryptRounds: 12 },
  database: { sync: false, logging: false, ssl: true },
  rateLimit: { maxRequests: 100 },
}
```

### Test

```typescript
{
  logging: { level: 'error', format: 'text' },
  security: { bcryptRounds: 4 },  // Faster for tests
  database: { sync: true, logging: false },
  rateLimit: { maxRequests: 10000 },  // No rate limiting in tests
}
```

## Configuration Summary

Print a summary of the current configuration (without sensitive data):

```typescript
import { getConfig } from './config';

const config = getConfig();
config.printConfigSummary();
```

Output:
```
📋 Configuration Summary:
═══════════════════════════════════════
Environment: development
API Port: 5000
API Host: localhost
Database: localhost:5432/freshroute_db
Redis: localhost:6379
CORS Origins: http://localhost:3000, http://localhost:5000
Rate Limit: 100 requests per 900s
Currency: USD ($)
Tax Rate: 15.0%
Storage Provider: local
Payment Provider: mock
Log Level: debug
═══════════════════════════════════════
```

## Testing

The configuration system includes comprehensive tests:

```bash
# Run configuration tests
npm test -- --testPathPattern=config

# Run all tests
npm test
```

Current test coverage: **85 tests** covering:
- Environment detection
- Configuration loading and defaults
- Validation (required vars, JWT secrets, database, ports, business settings)
- Parsing utilities (boolean, integer, float, arrays)
- Singleton pattern

## Best Practices

### Security

1. **Never commit `.env` files** to version control
2. Use strong, unique JWT secrets (at least 32 characters)
3. Use different secrets for access and refresh tokens
4. Enable SSL in production databases
5. Use environment-specific configurations

### Configuration Management

1. Keep `.env.example` up to date with all variables
2. Document any new configuration variables
3. Use validation to catch configuration errors early
4. Use the configuration service instead of accessing `process.env` directly

### Example: Adding New Configuration

```typescript
// 1. Add to env.types.ts
export interface NewFeatureConfig {
  enabled: boolean;
  apiKey: string;
}

export const ENV_KEYS = {
  // ... existing keys
  NEW_FEATURE_ENABLED: 'NEW_FEATURE_ENABLED',
  NEW_FEATURE_API_KEY: 'NEW_FEATURE_API_KEY',
} as const;

// 2. Add to config.service.ts
private buildNewFeatureConfig(): NewFeatureConfig {
  return {
    enabled: parseBoolean(process.env[ENV_KEYS.NEW_FEATURE_ENABLED], false),
    apiKey: getOptionalEnv(ENV_KEYS.NEW_FEATURE_API_KEY, ''),
  };
}

// 3. Add getter
public getNewFeatureConfig(): Readonly<NewFeatureConfig> {
  return Object.freeze({ ...this.config.newFeature });
}

// 4. Update .env.example
NEW_FEATURE_ENABLED=false
NEW_FEATURE_API_KEY=

// 5. Add tests
describe('New Feature Configuration', () => {
  it('should have default settings', () => {
    const config = ConfigService.getInstance();
    const featureConfig = config.getNewFeatureConfig();
    expect(featureConfig.enabled).toBe(false);
  });
});
```

## Troubleshooting

### Configuration Validation Failed

```
❌ Configuration validation failed: Missing required environment variables: DB_HOST, JWT_SECRET
```

**Solution:** Ensure all required variables are set in your `.env` file.

### JWT Secret Too Short

```
❌ Configuration validation failed: JWT_SECRET must be at least 32 characters long
```

**Solution:** Use a longer secret. Generate one with:
```bash
openssl rand -base64 32
```

### Invalid Port Number

```
❌ Configuration validation failed: BACKEND_PORT must be a valid port number (1-65535)
```

**Solution:** Use a valid port number between 1 and 65535.

## Support

For questions or issues:
1. Check this documentation
2. Review `.env.example` for configuration examples
3. Check test files for usage examples
4. Review validation error messages

## License

MIT License - See LICENSE file for details
