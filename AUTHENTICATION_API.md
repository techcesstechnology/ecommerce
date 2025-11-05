# Authentication API Documentation

## Overview

The FreshRoute Authentication API provides a comprehensive, secure authentication system with the following features:

- User registration with email verification
- Secure login with JWT tokens
- Two-factor authentication (2FA)
- Password reset functionality
- Role-based access control (RBAC)
- Rate limiting to prevent brute force attacks
- Input validation and sanitization
- Secure session management

## Security Features

### Password Requirements

Passwords must meet the following criteria:
- Minimum 8 characters long
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*()_+-=[]{};\\':"\\|,.<>/?)

### Token Management

- **Access Token**: Short-lived JWT token (default: 15 minutes) for API authentication
- **Refresh Token**: Long-lived token (default: 7 days) stored in httpOnly cookies for obtaining new access tokens
- Tokens are signed with secure secrets and include issuer/audience claims

### Rate Limiting

- **Login**: 5 attempts per 15 minutes per IP
- **Registration**: 3 attempts per hour per IP
- **Password Reset**: 3 attempts per hour per IP
- **General API**: 100 requests per 15 minutes per IP

### Security Headers

The API uses Helmet.js for secure HTTP headers including:
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options

## API Endpoints

### Register User

**POST** `/api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "SecurePassword123!",
  "phone": "+1234567890",
  "role": "customer"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully. Please check your email to verify your account.",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "customer",
    "emailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Rate Limit:** 3 requests per hour per IP

---

### Login

**POST** `/api/auth/login`

Authenticate user and receive access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "twoFactorCode": "123456"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "customer",
    "emailVerified": true,
    "lastLoginAt": "2024-01-01T00:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Note:** Refresh token is set as httpOnly cookie

**Rate Limit:** 5 attempts per 15 minutes per IP

---

### Refresh Token

**POST** `/api/auth/refresh`

Get a new access token using refresh token.

**Request:**
- Refresh token must be present in cookies (automatically sent by browser)
- Or can be sent in request body: `{ "refreshToken": "..." }`

**Response (200 OK):**
```json
{
  "message": "Token refreshed successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Logout

**POST** `/api/auth/logout`

Invalidate current refresh token and logout user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "message": "Logout successful"
}
```

---

### Verify Email

**GET** `/api/auth/verify-email/:token`

Verify user email address.

**Parameters:**
- `token`: Email verification token (sent via email)

**Response (200 OK):**
```json
{
  "message": "Email verified successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "emailVerified": true
  }
}
```

---

### Request Password Reset

**POST** `/api/auth/password-reset/request`

Request a password reset link.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "If an account with that email exists, a password reset link has been sent"
}
```

**Rate Limit:** 3 requests per hour per IP

---

### Reset Password

**POST** `/api/auth/password-reset/:token`

Reset password using reset token.

**Parameters:**
- `token`: Password reset token (sent via email)

**Request Body:**
```json
{
  "password": "NewSecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "message": "Password reset successfully"
}
```

---

### Setup Two-Factor Authentication

**POST** `/api/auth/2fa/setup`

Initialize 2FA setup for the current user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "message": "Two-factor authentication setup initiated",
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,..."
}
```

**Note:** QR code can be scanned with authenticator apps like Google Authenticator or Authy

---

### Enable Two-Factor Authentication

**POST** `/api/auth/2fa/enable`

Enable 2FA after verifying with a code from authenticator app.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "token": "123456"
}
```

**Response (200 OK):**
```json
{
  "message": "Two-factor authentication enabled successfully"
}
```

---

### Disable Two-Factor Authentication

**POST** `/api/auth/2fa/disable`

Disable 2FA for the current user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "message": "Two-factor authentication disabled successfully"
}
```

---

### Get Current User

**GET** `/api/auth/me`

Get current authenticated user's profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "role": "customer",
    "emailVerified": true,
    "twoFactorEnabled": false,
    "lastLoginAt": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Validation error message",
  "details": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 409 Conflict
```json
{
  "error": "Conflict",
  "message": "User with this email already exists"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too Many Requests",
  "message": "Too many login attempts. Please try again later."
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```

## Using Authentication in Your Application

### 1. Register and Login

```javascript
// Register
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    name: 'John Doe',
    password: 'SecurePassword123!'
  })
});

// Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Important: to receive cookies
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePassword123!'
  })
});

const { accessToken, user } = await loginResponse.json();
```

### 2. Making Authenticated Requests

```javascript
const response = await fetch('/api/protected-route', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  credentials: 'include' // Include cookies for refresh token
});
```

### 3. Handling Token Expiration

```javascript
async function makeAuthenticatedRequest(url, options = {}) {
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`
    },
    credentials: 'include'
  });

  // If token expired, refresh and retry
  if (response.status === 401) {
    const refreshResponse = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    });

    if (refreshResponse.ok) {
      const { accessToken: newToken } = await refreshResponse.json();
      accessToken = newToken;

      // Retry original request
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${accessToken}`
        }
      });
    }
  }

  return response;
}
```

## Environment Variables

The following environment variables must be configured:

```bash
# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_change_in_production_min_32_chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here_change_in_production_min_32_chars
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (for verification and password reset)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=noreply@freshroute.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=noreply@freshroute.com

# Application
NODE_ENV=production
```

## Security Best Practices

1. **Always use HTTPS in production** - Tokens should never be transmitted over unencrypted connections
2. **Keep secrets secret** - Never commit JWT secrets or other sensitive credentials to version control
3. **Rotate secrets regularly** - Change JWT secrets periodically
4. **Use strong passwords** - Enforce password requirements for all users
5. **Enable 2FA** - Encourage users to enable two-factor authentication
6. **Monitor for suspicious activity** - Watch for unusual login patterns or repeated failed attempts
7. **Keep dependencies updated** - Regularly update all security-related packages
8. **Use environment variables** - Never hardcode secrets in your code

## OWASP Top 10 Compliance

This authentication system addresses the following OWASP Top 10 security risks:

1. **A01:2021 – Broken Access Control**: Implemented role-based access control (RBAC)
2. **A02:2021 – Cryptographic Failures**: Using bcrypt for password hashing and secure JWT tokens
3. **A03:2021 – Injection**: Input validation and sanitization to prevent SQL/NoSQL injection
4. **A04:2021 – Insecure Design**: Rate limiting, account lockout, and secure token management
5. **A05:2021 – Security Misconfiguration**: Secure HTTP headers with Helmet.js
6. **A07:2021 – Identification and Authentication Failures**: Strong password requirements, 2FA support, and secure session management
7. **A08:2021 – Software and Data Integrity Failures**: JWT signature verification
8. **A09:2021 – Security Logging and Monitoring Failures**: Comprehensive security event logging
9. **A10:2021 – Server-Side Request Forgery**: Not applicable to authentication

## Support

For issues or questions, please contact the development team or create an issue in the repository.
