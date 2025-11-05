# Security Features Documentation

## Overview

The FreshRoute application implements comprehensive security measures following industry best practices and OWASP guidelines to protect user data and prevent common web vulnerabilities.

## Implemented Security Features

### 1. Authentication & Authorization

#### Password Security
- **Bcrypt Hashing**: Passwords are hashed using bcrypt with 12 salt rounds
- **Strong Password Requirements**:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- **Password Reset**: Secure token-based password reset with time-limited tokens (1 hour)

#### Token-Based Authentication
- **JWT Tokens**: JSON Web Tokens for stateless authentication
- **Access Tokens**: Short-lived tokens (15 minutes default) for API access
- **Refresh Tokens**: Long-lived tokens (7 days default) for obtaining new access tokens
- **Token Security**:
  - Signed with secure secrets
  - Include issuer and audience claims
  - Stored in httpOnly cookies (refresh tokens)
  - Proper token verification on each request

#### Two-Factor Authentication (2FA)
- **TOTP-based**: Time-based One-Time Password using HOTP algorithm
- **Authenticator App Support**: Compatible with Google Authenticator, Authy, etc.
- **QR Code Generation**: Easy setup with QR code scanning
- **Backup Options**: Users must verify 2FA before enabling

#### Role-Based Access Control (RBAC)
- **Three Roles**: customer, admin, vendor
- **Middleware Protection**: `authorize()` middleware for route protection
- **Fine-grained Permissions**: Multiple roles can be specified per route

### 2. Rate Limiting

Protection against brute force attacks and API abuse:

- **Login Attempts**: 5 attempts per 15 minutes per IP
- **Registration**: 3 attempts per hour per IP
- **Password Reset**: 3 attempts per hour per IP
- **General API**: 100 requests per 15 minutes per IP

Account lockout after 5 failed login attempts (15-minute lockout period).

### 3. Input Validation & Sanitization

#### Input Validation
- **express-validator**: Comprehensive input validation for all endpoints
- **Email Validation**: RFC-compliant email format checking
- **Phone Validation**: International phone number format validation
- **Password Strength**: Real-time password strength validation

#### XSS Prevention
- **Script Tag Removal**: Strips `<script>` tags from input
- **Event Handler Removal**: Removes `onclick`, `onerror`, etc.
- **Protocol Filtering**: Blocks `javascript:` and malicious `data:` protocols
- **Recursive Sanitization**: Handles nested objects and arrays

#### NoSQL Injection Prevention
- **Operator Filtering**: Removes MongoDB operators (`$where`, `$ne`, `$gt`, etc.)
- **Recursive Cleaning**: Sanitizes nested query structures
- **TypeORM Protection**: Parameterized queries through TypeORM

### 4. HTTP Security Headers

Implemented via Helmet.js:

- **Content Security Policy (CSP)**: Restricts resource loading
- **HTTP Strict Transport Security (HSTS)**: Forces HTTPS connections
  - Max age: 1 year
  - Include subdomains
  - Preload enabled
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME sniffing
- **X-XSS-Protection**: Enables browser XSS filtering

### 5. Secure Cookie Configuration

Cookies are configured with security best practices:

- **httpOnly**: Prevents JavaScript access to cookies
- **secure**: Only transmitted over HTTPS (production)
- **sameSite: 'strict'**: Prevents CSRF attacks
- **maxAge**: 7 days for refresh tokens

### 6. CORS Configuration

- **Origin Validation**: Whitelist-based origin checking
- **Credentials Support**: Allows cookies with cross-origin requests
- **Dynamic Origins**: Supports development and production environments

### 7. Error Handling

Secure error handling that doesn't expose sensitive information:

- **Production Mode**: Generic error messages
- **Development Mode**: Detailed error messages for debugging
- **No Stack Traces**: Stack traces not exposed to clients
- **Consistent Format**: Standardized error response structure

### 8. Session Management

- **Stateless Sessions**: JWT-based authentication
- **Refresh Token Rotation**: New refresh token on each refresh
- **Token Invalidation**: Logout invalidates refresh tokens
- **Session Tracking**: Last login time and IP tracking

### 9. Email Verification

- **Token-Based**: Secure random token generation (32 bytes)
- **Time-Limited**: 24-hour expiration
- **One-Time Use**: Tokens consumed on verification

### 10. Data Protection

- **Password Exclusion**: Passwords never returned in API responses
- **Sensitive Field Filtering**: 2FA secrets and token hashes excluded
- **Minimal Data Exposure**: Only necessary fields returned

## Security Architecture

```
┌─────────────────┐
│   Client        │
└────────┬────────┘
         │ HTTPS
         │ (TLS 1.2+)
         ▼
┌─────────────────┐
│  Rate Limiter   │ ◄── IP-based limits
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   CORS Check    │ ◄── Origin validation
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Helmet.js      │ ◄── Security headers
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Sanitization   │ ◄── XSS & NoSQL injection prevention
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Validation     │ ◄── Input validation
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Authentication │ ◄── JWT verification
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Authorization  │ ◄── Role checking
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Route Handler  │
└─────────────────┘
```

## Security Testing

### Unit Tests
- Password hashing and comparison
- JWT token generation and verification
- Token generation (email, password reset)
- Authentication middleware
- Authorization middleware
- Input validation
- Sanitization logic

### Test Coverage
- 38 test cases covering critical security functions
- All tests passing with 100% success rate

## OWASP Top 10 Compliance

### A01:2021 – Broken Access Control ✅
- Role-based access control (RBAC)
- Authorization middleware
- Email verification requirements

### A02:2021 – Cryptographic Failures ✅
- Bcrypt password hashing (12 rounds)
- Secure JWT token generation
- Strong password requirements
- Secure random token generation

### A03:2021 – Injection ✅
- Input validation with express-validator
- XSS sanitization
- NoSQL injection prevention
- TypeORM parameterized queries

### A04:2021 – Insecure Design ✅
- Rate limiting
- Account lockout mechanism
- Token expiration
- Refresh token rotation

### A05:2021 – Security Misconfiguration ✅
- Helmet.js for secure headers
- CORS configuration
- Secure cookie settings
- Error handling without information disclosure

### A06:2021 – Vulnerable Components
- Regular dependency updates
- Security audit with `npm audit`
- Advisory database checks

### A07:2021 – Identification and Authentication Failures ✅
- Strong password requirements
- Two-factor authentication (2FA)
- Secure session management
- Account lockout after failed attempts
- Email verification

### A08:2021 – Software and Data Integrity Failures ✅
- JWT signature verification
- Token issuer/audience validation
- No unsigned JWTs allowed

### A09:2021 – Security Logging and Monitoring Failures ✅
- Login attempt logging
- Failed authentication logging
- Security event tracking (last login, IP)

### A10:2021 – Server-Side Request Forgery (SSRF)
- Not applicable to current authentication implementation

## Deployment Checklist

Before deploying to production, ensure:

- [ ] JWT secrets are strong and unique (minimum 32 characters)
- [ ] Environment variables are properly configured
- [ ] HTTPS is enabled with valid SSL certificate
- [ ] Database connections use SSL/TLS
- [ ] Email service is configured for verification emails
- [ ] Rate limiting is enabled
- [ ] Error logging is set up
- [ ] Security headers are verified
- [ ] Cookie secure flag is enabled
- [ ] CORS origins are properly whitelisted
- [ ] Dependencies are up to date
- [ ] Security audit has been run

## Monitoring & Logging

### Security Events Logged
- Failed login attempts
- Successful logins with timestamp and IP
- Account lockouts
- Password reset requests
- 2FA setup and changes
- Token refresh requests

### Recommended Monitoring
- Monitor for repeated failed login attempts
- Track unusual login patterns (location, time)
- Alert on multiple password reset requests
- Monitor rate limit violations
- Track 2FA enrollment rates

## Future Security Enhancements

Potential improvements for future versions:

1. **Account Recovery**: Backup codes for 2FA
2. **Device Management**: Track and manage trusted devices
3. **Security Questions**: Additional account recovery options
4. **IP Whitelisting**: Allow IP restrictions for admin accounts
5. **Login Notifications**: Email notifications for new logins
6. **Session Management**: Active session viewing and revocation
7. **Biometric Authentication**: Support for fingerprint/face recognition
8. **Risk-Based Authentication**: Adaptive authentication based on risk factors
9. **CAPTCHA**: Additional protection against automated attacks
10. **Security Audit Logs**: Comprehensive audit trail

## Incident Response

In case of a security incident:

1. **Immediate Actions**:
   - Rotate all JWT secrets
   - Invalidate all active sessions
   - Force password reset for affected accounts
   - Enable additional logging

2. **Investigation**:
   - Review logs for suspicious activity
   - Identify affected users
   - Determine scope of breach

3. **Communication**:
   - Notify affected users
   - Document incident details
   - Report to relevant authorities if required

4. **Prevention**:
   - Patch vulnerabilities
   - Update security measures
   - Enhance monitoring

## Contact

For security concerns or to report vulnerabilities, please contact:
- Security Team: security@freshroute.com
- Response Time: 24-48 hours for critical issues

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
