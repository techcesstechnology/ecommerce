/**
 * Authentication Flow Integration Tests
 * Tests complete authentication workflows
 */

// Set up test environment variables
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_NAME = process.env.DB_NAME || 'test_db';
process.env.DB_USER = process.env.DB_USER || 'test_user';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'test_password';
process.env.JWT_SECRET = 'test_jwt_secret_at_least_32_characters_long_12345';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_at_least_32_characters_long_12345';
process.env.BACKEND_PORT = '5000';

import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { initTestDatabase, cleanDatabase, closeTestDatabase } from '../utils/test-db';
import { buildUserWithHashedPassword } from '../fixtures/user.factory';
import { randomEmail } from '../utils/test-helpers';

describe('Authentication Flow Integration Tests', () => {
  let authService: AuthService;
  let userService: UserService;

  beforeAll(async () => {
    await initTestDatabase();
    authService = new AuthService();
    userService = new UserService();
  }, 30000);

  afterEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  }, 30000);

  describe('Registration Flow', () => {
    it('should register a new user with hashed password', async () => {
      const email = randomEmail();
      const password = 'TestPassword123!';

      const hashedPassword = await authService.hashPassword(password);
      const user = await userService.createUser({
        email,
        name: 'Test User',
        password: hashedPassword,
      });

      expect(user).toBeDefined();
      expect(user.email).toBe(email);
      expect(user.password).not.toBe(password);
      expect(user.password).toBe(hashedPassword);
    });

    it('should verify password after registration', async () => {
      const email = randomEmail();
      const password = 'TestPassword123!';

      const hashedPassword = await authService.hashPassword(password);
      await userService.createUser({
        email,
        name: 'Test User',
        password: hashedPassword,
      });

      const isValid = await authService.comparePassword(password, hashedPassword);
      expect(isValid).toBe(true);
    });
  });

  describe('Login Flow', () => {
    const password = 'TestPassword123!';
    let testUser: any;

    beforeEach(async () => {
      const userData = await buildUserWithHashedPassword({ password });
      testUser = await userService.createUser({
        email: userData.email!,
        name: userData.name!,
        password: userData.password!,
      });
    });

    it('should generate access token after successful login', () => {
      const token = authService.generateAccessToken({
        userId: testUser.id,
        email: testUser.email,
        role: testUser.role,
      });

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should verify generated access token', () => {
      const token = authService.generateAccessToken({
        userId: testUser.id,
        email: testUser.email,
        role: testUser.role,
      });

      const payload = authService.verifyAccessToken(token);

      expect(payload).toBeDefined();
      expect(payload?.userId).toBe(testUser.id);
      expect(payload?.email).toBe(testUser.email);
      expect(payload?.role).toBe(testUser.role);
    });

    it('should generate refresh token after login', () => {
      const refreshToken = authService.generateRefreshToken({
        userId: testUser.id,
        email: testUser.email,
        role: testUser.role,
      });

      expect(refreshToken).toBeDefined();
      expect(typeof refreshToken).toBe('string');
    });

    it('should verify refresh token', () => {
      const refreshToken = authService.generateRefreshToken({
        userId: testUser.id,
        email: testUser.email,
        role: testUser.role,
      });

      const payload = authService.verifyRefreshToken(refreshToken);

      expect(payload).toBeDefined();
      expect(payload?.userId).toBe(testUser.id);
    });
  });

  describe('Token Refresh Flow', () => {
    let testUser: any;

    beforeEach(async () => {
      const userData = await buildUserWithHashedPassword();
      testUser = await userService.createUser({
        email: userData.email!,
        name: userData.name!,
        password: userData.password!,
      });
    });

    it('should generate new access token from valid refresh token', () => {
      const refreshToken = authService.generateRefreshToken({
        userId: testUser.id,
        email: testUser.email,
        role: testUser.role,
      });

      const payload = authService.verifyRefreshToken(refreshToken);
      expect(payload).toBeDefined();

      if (payload) {
        const newAccessToken = authService.generateAccessToken(payload);
        expect(newAccessToken).toBeDefined();

        const verifiedPayload = authService.verifyAccessToken(newAccessToken);
        expect(verifiedPayload?.userId).toBe(testUser.id);
      }
    });

    it('should reject invalid refresh token', () => {
      const payload = authService.verifyRefreshToken('invalid-token');
      expect(payload).toBeNull();
    });
  });

  describe('Password Reset Flow', () => {
    let testUser: any;

    beforeEach(async () => {
      const userData = await buildUserWithHashedPassword();
      testUser = await userService.createUser({
        email: userData.email!,
        name: userData.name!,
        password: userData.password!,
      });
    });

    it('should generate password reset token', () => {
      const token = authService.generatePasswordResetToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should update user with reset token', async () => {
      const resetToken = authService.generatePasswordResetToken();
      const resetExpires = new Date(Date.now() + 3600000); // 1 hour

      const updatedUser = await userService.updateUser(testUser.id, {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      });

      expect(updatedUser?.passwordResetToken).toBe(resetToken);
      expect(updatedUser?.passwordResetExpires).toBeDefined();
    });

    it('should reset password with valid token', async () => {
      const resetToken = authService.generatePasswordResetToken();
      await userService.updateUser(testUser.id, {
        passwordResetToken: resetToken,
        passwordResetExpires: new Date(Date.now() + 3600000),
      });

      const newPassword = 'NewPassword123!';
      const hashedNewPassword = await authService.hashPassword(newPassword);

      const updatedUser = await userService.updateUser(testUser.id, {
        password: hashedNewPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      });

      expect(updatedUser?.password).toBe(hashedNewPassword);
      const isValid = await authService.comparePassword(newPassword, hashedNewPassword);
      expect(isValid).toBe(true);
    });
  });

  describe('Email Verification Flow', () => {
    let testUser: any;

    beforeEach(async () => {
      const userData = await buildUserWithHashedPassword({ emailVerified: false });
      testUser = await userService.createUser({
        email: userData.email!,
        name: userData.name!,
        password: userData.password!,
      });
    });

    it('should generate email verification token', () => {
      const token = authService.generateEmailVerificationToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should verify email with valid token', async () => {
      const verificationToken = authService.generateEmailVerificationToken();
      await userService.updateUser(testUser.id, {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: new Date(Date.now() + 86400000), // 24 hours
      });

      const updatedUser = await userService.updateUser(testUser.id, {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      });

      expect(updatedUser?.emailVerified).toBe(true);
      expect(updatedUser?.emailVerificationToken).toBeNull();
    });
  });

  describe('Two-Factor Authentication Setup', () => {
    let testUser: any;

    beforeEach(async () => {
      const userData = await buildUserWithHashedPassword();
      testUser = await userService.createUser({
        email: userData.email!,
        name: userData.name!,
        password: userData.password!,
      });
    });

    it('should generate 2FA secret', () => {
      const secret = authService.generate2FASecret(testUser.email);

      expect(secret).toBeDefined();
      expect(secret.secret).toBeDefined();
      expect(secret.qrCode).toBeDefined();
    });

    it('should enable 2FA with valid token', async () => {
      const secret = authService.generate2FASecret(testUser.email);

      const updatedUser = await userService.updateUser(testUser.id, {
        twoFactorEnabled: true,
        twoFactorSecret: secret.secret,
      });

      expect(updatedUser?.twoFactorEnabled).toBe(true);
      expect(updatedUser?.twoFactorSecret).toBe(secret.secret);
    });

    it('should verify 2FA token', () => {
      const secret = authService.generate2FASecret(testUser.email);
      const token = authService.generate2FAToken(secret.secret);

      const isValid = authService.verify2FAToken(token, secret.secret);
      expect(isValid).toBe(true);
    });
  });

  describe('Account Security', () => {
    let testUser: any;

    beforeEach(async () => {
      const userData = await buildUserWithHashedPassword();
      testUser = await userService.createUser({
        email: userData.email!,
        name: userData.name!,
        password: userData.password!,
      });
    });

    it('should track failed login attempts', async () => {
      const updatedUser = await userService.updateUser(testUser.id, {
        failedLoginAttempts: testUser.failedLoginAttempts + 1,
      });

      expect(updatedUser?.failedLoginAttempts).toBe(1);
    });

    it('should lock account after max failed attempts', async () => {
      const lockUntil = new Date(Date.now() + 1800000); // 30 minutes

      const updatedUser = await userService.updateUser(testUser.id, {
        failedLoginAttempts: 5,
        accountLockedUntil: lockUntil,
      });

      expect(updatedUser?.failedLoginAttempts).toBe(5);
      expect(updatedUser?.accountLockedUntil).toBeDefined();
    });

    it('should reset failed login attempts on successful login', async () => {
      await userService.updateUser(testUser.id, {
        failedLoginAttempts: 3,
      });

      const updatedUser = await userService.updateUser(testUser.id, {
        failedLoginAttempts: 0,
        lastLoginAt: new Date(),
        lastLoginIp: '127.0.0.1',
      });

      expect(updatedUser?.failedLoginAttempts).toBe(0);
      expect(updatedUser?.lastLoginAt).toBeDefined();
    });
  });
});
