# FreshRoute Authentication & Authorization System

## Overview

This is a comprehensive authentication and authorization system for the FreshRoute e-commerce platform, built with TypeScript, Express, and JWT tokens.

## Features

### Authentication
- ✅ Email/password authentication
- ✅ JWT token-based authentication
- ✅ Refresh token mechanism
- ✅ Password reset functionality
- ✅ Email verification
- ✅ Session management
- ✅ Token blacklisting for logout

### Authorization
- ✅ Role-based access control (RBAC)
- ✅ Permission-based access control
- ✅ Four user roles: CUSTOMER, ADMIN, MANAGER, DRIVER

### Security
- ✅ Password hashing with bcrypt
- ✅ Rate limiting
- ✅ Request validation with Joi
- ✅ XSS protection with Helmet
- ✅ CSRF protection
- ✅ Secure HTTP headers

## Installation

```bash
cd backend
npm install
```

## Configuration

Copy `.env.example` to `.env` and configure:

```env
NODE_ENV=development
PORT=3000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=10

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000
```

## Usage

### Build and Run

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Linting

```bash
npm run lint
```

## API Endpoints

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "role": "CUSTOMER" // optional
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer your-access-token
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

#### Request Password Reset
```http
POST /api/auth/request-password-reset
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token",
  "password": "NewSecurePass123!"
}
```

#### Verify Email
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "verification-token"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer your-access-token
```

### User Management (Admin Only)

#### Get User by ID
```http
GET /api/users/:id
Authorization: Bearer your-access-token
```

#### Get User by Email
```http
GET /api/users/email/:email
Authorization: Bearer your-access-token
```

## User Roles

### CUSTOMER
- View products
- Create and view orders
- Manage own profile

### DRIVER
- View deliveries and orders
- Update delivery status

### MANAGER
- Full product management
- View and update orders
- View users

### ADMIN
- Full access to all resources
- All CRUD operations

## Security Best Practices

1. **Password Requirements**
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - At least one special character (@$!%*?&)

2. **Token Management**
   - Access tokens expire in 15 minutes
   - Refresh tokens expire in 7 days
   - Tokens are blacklisted on logout
   - Use HTTPS in production

3. **Rate Limiting**
   - Default: 100 requests per 15 minutes
   - Configurable per environment

4. **Headers**
   - Content Security Policy
   - XSS Protection
   - Frame Options
   - HSTS

## Architecture

### Directory Structure
```
backend/
├── src/
│   ├── auth/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   └── user.controller.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   └── roles.middleware.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   └── token.service.ts
│   │   └── validators/
│   │       └── auth.validator.ts
│   ├── config/
│   │   └── auth.config.ts
│   └── index.ts
├── package.json
├── tsconfig.json
└── jest.config.js
```

### Key Components

#### TokenService
Handles JWT token generation, verification, and blacklisting.

#### AuthService
Manages user registration, login, password reset, and email verification.

#### AuthController
HTTP request handlers for authentication endpoints.

#### Middleware
- `authenticate`: Verifies JWT token
- `requireRole`: Checks user roles
- `requirePermission`: Checks specific permissions

#### Validators
Request validation using Joi schemas.

## Testing

The system includes comprehensive unit tests:
- Token service tests
- Authentication service tests
- Validator tests
- Middleware tests

Run with:
```bash
npm test
```

## Development Notes

### In-Memory Storage
This implementation uses in-memory storage for simplicity. In production:
- Replace with a database (PostgreSQL, MongoDB, etc.)
- Implement proper token storage (Redis for blacklist)
- Add email sending service
- Implement OAuth providers (Google, etc.)

### Future Enhancements
- [ ] Database integration
- [ ] Email service integration
- [ ] OAuth providers (Google, Facebook)
- [ ] Two-factor authentication
- [ ] Account lockout after failed attempts
- [ ] Session management improvements
- [ ] Audit logging

## License

ISC
