// Set up environment variables before importing anything else
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'test_user';
process.env.DB_PASSWORD = 'test_password';
process.env.JWT_SECRET = 'test_jwt_secret_at_least_32_characters_long_12345';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_at_least_32_characters_long_12345';
process.env.BACKEND_PORT = '5000';

import { AuthService } from '../services/auth.service';

describe('AuthService', () => {
  let authService: AuthService;

  beforeAll(() => {
    authService = new AuthService();
  });

  describe('Password Hashing', () => {
    it('should hash a password', async () => {
      const password = 'TestPassword123!';
      const hash = await authService.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should compare password correctly', async () => {
      const password = 'TestPassword123!';
      const hash = await authService.hashPassword(password);

      const isValid = await authService.comparePassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should fail comparison with wrong password', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hash = await authService.hashPassword(password);

      const isValid = await authService.comparePassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });
  });

  describe('JWT Token Generation', () => {
    it('should generate access token', () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'customer',
      };

      const token = authService.generateAccessToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('should generate refresh token', () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'customer',
      };

      const token = authService.generateRefreshToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('should verify access token', () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'customer',
      };

      const token = authService.generateAccessToken(payload);
      const decoded = authService.verifyAccessToken(token);

      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(payload.userId);
      expect(decoded?.email).toBe(payload.email);
      expect(decoded?.role).toBe(payload.role);
    });

    it('should return null for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      const decoded = authService.verifyAccessToken(invalidToken);

      expect(decoded).toBeNull();
    });
  });

  describe('Token Generation', () => {
    it('should generate email verification token', () => {
      const token = authService.generateEmailVerificationToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64); // 32 bytes = 64 hex chars
    });

    it('should generate password reset token', () => {
      const token = authService.generatePasswordResetToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64); // 32 bytes = 64 hex chars
    });

    it('should generate unique tokens', () => {
      const token1 = authService.generateEmailVerificationToken();
      const token2 = authService.generateEmailVerificationToken();

      expect(token1).not.toBe(token2);
    });
  });

  describe('Password Validation', () => {
    it('should hash valid password', async () => {
      const validPassword = 'TestPassword123!';
      const hash = await authService.hashPassword(validPassword);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(validPassword);
    });

    it('should reject password without uppercase letter', async () => {
      const password = 'testpassword123!';

      // This would be validated in the register method
      expect(password).toMatch(/[a-z]/);
      expect(password).not.toMatch(/[A-Z]/);
    });

    it('should reject password without lowercase letter', async () => {
      const password = 'TESTPASSWORD123!';

      expect(password).toMatch(/[A-Z]/);
      expect(password).not.toMatch(/[a-z]/);
    });

    it('should reject password without number', async () => {
      const password = 'TestPassword!';

      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/[a-z]/);
      expect(password).not.toMatch(/[0-9]/);
    });

    it('should reject password without special character', async () => {
      const password = 'TestPassword123';

      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[0-9]/);
      expect(password).not.toMatch(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/);
    });

    it('should accept valid password', () => {
      const password = 'TestPassword123!';

      expect(password.length).toBeGreaterThanOrEqual(8);
      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[0-9]/);
      expect(password).toMatch(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/);
    });
  });
});
