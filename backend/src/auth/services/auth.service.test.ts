import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { UserRole } from '../../config/auth.config';

describe('AuthService', () => {
  beforeEach(() => {
    AuthService.clearUsers();
    TokenService.clearBlacklist();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'Test123!@#',
      };

      const result = await AuthService.register(dto);

      expect(result.user).toBeTruthy();
      expect(result.user.email).toBe(dto.email.toLowerCase());
      expect(result.user.role).toBe(UserRole.CUSTOMER);
      expect(result.user.isEmailVerified).toBe(false);
      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
    });

    it('should register user with specified role', async () => {
      const dto = {
        email: 'admin@example.com',
        password: 'Admin123!@#',
        role: UserRole.ADMIN,
      };

      const result = await AuthService.register(dto);

      expect(result.user.role).toBe(UserRole.ADMIN);
    });

    it('should throw error if user already exists', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'Test123!@#',
      };

      await AuthService.register(dto);

      await expect(AuthService.register(dto)).rejects.toThrow(
        'User with this email already exists'
      );
    });

    it('should convert email to lowercase', async () => {
      const dto = {
        email: 'TEST@EXAMPLE.COM',
        password: 'Test123!@#',
      };

      const result = await AuthService.register(dto);

      expect(result.user.email).toBe('test@example.com');
    });

    it('should not include password in response', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'Test123!@#',
      };

      const result = await AuthService.register(dto);

      expect('password' in result.user).toBe(false);
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await AuthService.register({
        email: 'test@example.com',
        password: 'Test123!@#',
      });
    });

    it('should login user successfully', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'Test123!@#',
      };

      const result = await AuthService.login(dto);

      expect(result.user).toBeTruthy();
      expect(result.user.email).toBe(dto.email.toLowerCase());
      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
    });

    it('should throw error for non-existent user', async () => {
      const dto = {
        email: 'nonexistent@example.com',
        password: 'Test123!@#',
      };

      await expect(AuthService.login(dto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for wrong password', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      await expect(AuthService.login(dto)).rejects.toThrow('Invalid credentials');
    });

    it('should be case-insensitive for email', async () => {
      const dto = {
        email: 'TEST@EXAMPLE.COM',
        password: 'Test123!@#',
      };

      const result = await AuthService.login(dto);

      expect(result.user).toBeTruthy();
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const registerResult = await AuthService.register({
        email: 'test@example.com',
        password: 'Test123!@#',
      });

      // Wait a bit to ensure different iat timestamp
      await new Promise(resolve => setTimeout(resolve, 1000));

      const result = await AuthService.refreshToken(registerResult.refreshToken);

      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
      expect(result.accessToken).not.toBe(registerResult.accessToken);
      expect(result.refreshToken).not.toBe(registerResult.refreshToken);
    });

    it('should throw error for invalid refresh token', async () => {
      await expect(AuthService.refreshToken('invalid_token')).rejects.toThrow(
        'Invalid refresh token'
      );
    });

    it('should blacklist old refresh token', async () => {
      const registerResult = await AuthService.register({
        email: 'test@example.com',
        password: 'Test123!@#',
      });

      const oldRefreshToken = registerResult.refreshToken;
      await AuthService.refreshToken(oldRefreshToken);

      expect(TokenService.isBlacklisted(oldRefreshToken)).toBe(true);
    });
  });

  describe('logout', () => {
    it('should blacklist both tokens', async () => {
      const registerResult = await AuthService.register({
        email: 'test@example.com',
        password: 'Test123!@#',
      });

      AuthService.logout(registerResult.accessToken, registerResult.refreshToken);

      expect(TokenService.isBlacklisted(registerResult.accessToken)).toBe(true);
      expect(TokenService.isBlacklisted(registerResult.refreshToken)).toBe(true);
    });
  });

  describe('requestPasswordReset', () => {
    it('should return success message for existing user', async () => {
      await AuthService.register({
        email: 'test@example.com',
        password: 'Test123!@#',
      });

      const result = await AuthService.requestPasswordReset('test@example.com');

      expect(result.message).toBeTruthy();
      expect(result.resetToken).toBeTruthy();
    });

    it('should return success message for non-existent user', async () => {
      const result = await AuthService.requestPasswordReset('nonexistent@example.com');

      expect(result.message).toBeTruthy();
      expect(result.resetToken).toBeUndefined();
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      await AuthService.register({
        email: 'test@example.com',
        password: 'Test123!@#',
      });

      const resetResult = await AuthService.requestPasswordReset('test@example.com');
      const resetToken = resetResult.resetToken!;

      const result = await AuthService.resetPassword(resetToken, 'NewPassword123!');

      expect(result.message).toBeTruthy();

      // Verify can login with new password
      const loginResult = await AuthService.login({
        email: 'test@example.com',
        password: 'NewPassword123!',
      });

      expect(loginResult).toBeTruthy();
    });

    it('should throw error for invalid token', async () => {
      await expect(
        AuthService.resetPassword('invalid_token', 'NewPassword123!')
      ).rejects.toThrow('Invalid or expired reset token');
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const registerResult = await AuthService.register({
        email: 'test@example.com',
        password: 'Test123!@#',
      });

      const user = AuthService.getUserById(registerResult.user.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const verificationToken = (user as any).emailVerificationToken;

      const result = AuthService.verifyEmail(verificationToken);

      expect(result.message).toBeTruthy();

      const verifiedUser = AuthService.getUserById(registerResult.user.id);
      expect(verifiedUser?.isEmailVerified).toBe(true);
    });

    it('should throw error for invalid token', () => {
      expect(() => AuthService.verifyEmail('invalid_token')).toThrow(
        'Invalid verification token'
      );
    });
  });

  describe('getUserById', () => {
    it('should return user by ID', async () => {
      const registerResult = await AuthService.register({
        email: 'test@example.com',
        password: 'Test123!@#',
      });

      const user = AuthService.getUserById(registerResult.user.id);

      expect(user).toBeTruthy();
      expect(user?.id).toBe(registerResult.user.id);
      expect(user?.email).toBe('test@example.com');
    });

    it('should return null for non-existent user', () => {
      const user = AuthService.getUserById('non_existent_id');
      expect(user).toBeNull();
    });

    it('should not include password', async () => {
      const registerResult = await AuthService.register({
        email: 'test@example.com',
        password: 'Test123!@#',
      });

      const user = AuthService.getUserById(registerResult.user.id);

      expect('password' in (user || {})).toBe(false);
    });
  });

  describe('getUserByEmail', () => {
    it('should return user by email', async () => {
      await AuthService.register({
        email: 'test@example.com',
        password: 'Test123!@#',
      });

      const user = AuthService.getUserByEmail('test@example.com');

      expect(user).toBeTruthy();
      expect(user?.email).toBe('test@example.com');
    });

    it('should be case-insensitive', async () => {
      await AuthService.register({
        email: 'test@example.com',
        password: 'Test123!@#',
      });

      const user = AuthService.getUserByEmail('TEST@EXAMPLE.COM');

      expect(user).toBeTruthy();
      expect(user?.email).toBe('test@example.com');
    });

    it('should return null for non-existent user', () => {
      const user = AuthService.getUserByEmail('nonexistent@example.com');
      expect(user).toBeNull();
    });
  });

  describe('hashPassword', () => {
    it('should hash password', async () => {
      const password = 'Test123!@#';
      const hash = await AuthService.hashPassword(password);

      expect(hash).toBeTruthy();
      expect(hash).not.toBe(password);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'Test123!@#';
      const hash = await AuthService.hashPassword(password);

      const result = await AuthService.comparePassword(password, hash);

      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'Test123!@#';
      const hash = await AuthService.hashPassword(password);

      const result = await AuthService.comparePassword('WrongPassword', hash);

      expect(result).toBe(false);
    });
  });
});
