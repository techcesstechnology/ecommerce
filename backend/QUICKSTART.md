# FreshRoute Authentication System - Quick Start Guide

## Overview
This guide demonstrates how to use the FreshRoute authentication and authorization system.

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configurations:
```env
NODE_ENV=development
PORT=3000

# JWT Configuration - CHANGE THESE IN PRODUCTION!
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

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
# Build
npm run build

# Start
npm start
```

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## API Usage Examples

### 1. Register a New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "SecurePass123!",
    "role": "CUSTOMER"
  }'
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_1234567890_abc123",
      "email": "customer@example.com",
      "role": "CUSTOMER",
      "isEmailVerified": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "SecurePass123!"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_1234567890_abc123",
      "email": "customer@example.com",
      "role": "CUSTOMER",
      "isEmailVerified": false
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Get User Profile (Protected Route)

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "user_1234567890_abc123",
    "email": "customer@example.com",
    "role": "CUSTOMER",
    "isEmailVerified": false
  }
}
```

### 4. Refresh Access Token

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 5. Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### 6. Request Password Reset

```bash
curl -X POST http://localhost:3000/api/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Password reset email sent",
  "resetToken": "abc123def456..." // Only in development mode
}
```

### 7. Reset Password

```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "RESET_TOKEN_FROM_EMAIL",
    "password": "NewSecurePass123!"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

### 8. Verify Email

```bash
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "EMAIL_VERIFICATION_TOKEN"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

### 9. Get User by ID (Admin Only)

```bash
curl -X GET http://localhost:3000/api/users/user_1234567890_abc123 \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "user_1234567890_abc123",
    "email": "customer@example.com",
    "role": "CUSTOMER",
    "isEmailVerified": true
  }
}
```

## User Roles and Permissions

### CUSTOMER
- Can view products
- Can create and view their own orders
- Can manage their own profile

### DRIVER
- Can view deliveries and orders
- Can update delivery status

### MANAGER
- Full product management (CRUD)
- Can view and update orders
- Can view users

### ADMIN
- Full access to all resources
- All CRUD operations on any resource

## Password Requirements

Passwords must meet the following criteria:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

## Error Handling

All errors follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common error codes:
- 400: Bad Request (validation errors)
- 401: Unauthorized (authentication required or invalid credentials)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error

## Security Best Practices

1. **Always use HTTPS in production**
2. **Keep secrets secure**: Never commit `.env` file to version control
3. **Rotate JWT secrets regularly**
4. **Set appropriate token expiration times**
5. **Enable rate limiting** to prevent brute force attacks
6. **Monitor authentication logs** for suspicious activity
7. **Implement account lockout** after failed login attempts (future enhancement)
8. **Use strong passwords** and enforce password complexity rules

## Integration with Frontend

### Storing Tokens
```javascript
// Store tokens securely
localStorage.setItem('accessToken', response.data.accessToken);
localStorage.setItem('refreshToken', response.data.refreshToken);

// Include token in requests
fetch('/api/auth/profile', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  }
});
```

### Token Refresh Flow
```javascript
// Intercept 401 responses and refresh token
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  
  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    return data.data.accessToken;
  }
  
  // Redirect to login if refresh fails
  window.location.href = '/login';
}
```

## Production Deployment Checklist

- [ ] Change all default secrets in `.env`
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper CORS origins
- [ ] Set up HTTPS/TLS
- [ ] Configure proper rate limiting
- [ ] Set up database (replace in-memory storage)
- [ ] Implement email service for verification and password reset
- [ ] Set up logging and monitoring
- [ ] Configure backup strategy
- [ ] Implement session management with Redis
- [ ] Add two-factor authentication (optional)
- [ ] Set up proper error tracking (e.g., Sentry)

## Troubleshooting

### "Token expired" error
- Access tokens expire after 15 minutes by default
- Use the refresh token to get a new access token
- Implement automatic token refresh in your client

### "Invalid credentials" error
- Check email and password are correct
- Verify user exists in the system
- Check password meets requirements

### Rate limit exceeded
- Too many requests from your IP
- Wait for the rate limit window to reset (default: 15 minutes)
- Reduce request frequency

## Support

For issues or questions:
1. Check the README.md for detailed documentation
2. Review the test files for usage examples
3. Check application logs for error details

## License

ISC
