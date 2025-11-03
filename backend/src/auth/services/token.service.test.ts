import { TokenService } from '../services/token.service';
import { UserRole } from '../../config/auth.config';

describe('TokenService', () => {
  beforeEach(() => {
    TokenService.clearBlacklist();
  });

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const payload = {
        userId: 'user_123',
        email: 'test@example.com',
        role: UserRole.CUSTOMER,
      };

      const token = TokenService.generateAccessToken(payload);
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const payload = {
        userId: 'user_123',
        email: 'test@example.com',
        role: UserRole.CUSTOMER,
      };

      const token = TokenService.generateRefreshToken(payload);
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', () => {
      const payload = {
        userId: 'user_123',
        email: 'test@example.com',
        role: UserRole.CUSTOMER,
      };

      const token = TokenService.generateAccessToken(payload);
      const verified = TokenService.verifyAccessToken(token);

      expect(verified).toBeTruthy();
      expect(verified?.userId).toBe(payload.userId);
      expect(verified?.email).toBe(payload.email);
      expect(verified?.role).toBe(payload.role);
    });

    it('should return null for invalid token', () => {
      const verified = TokenService.verifyAccessToken('invalid_token');
      expect(verified).toBeNull();
    });

    it('should return null for blacklisted token', () => {
      const payload = {
        userId: 'user_123',
        email: 'test@example.com',
        role: UserRole.CUSTOMER,
      };

      const token = TokenService.generateAccessToken(payload);
      TokenService.blacklistToken(token);

      const verified = TokenService.verifyAccessToken(token);
      expect(verified).toBeNull();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const payload = {
        userId: 'user_123',
        email: 'test@example.com',
        role: UserRole.CUSTOMER,
      };

      const token = TokenService.generateRefreshToken(payload);
      const verified = TokenService.verifyRefreshToken(token);

      expect(verified).toBeTruthy();
      expect(verified?.userId).toBe(payload.userId);
      expect(verified?.email).toBe(payload.email);
      expect(verified?.role).toBe(payload.role);
    });

    it('should return null for invalid refresh token', () => {
      const verified = TokenService.verifyRefreshToken('invalid_token');
      expect(verified).toBeNull();
    });
  });

  describe('generateTokenPair', () => {
    it('should generate both access and refresh tokens', () => {
      const payload = {
        userId: 'user_123',
        email: 'test@example.com',
        role: UserRole.CUSTOMER,
      };

      const tokens = TokenService.generateTokenPair(payload);

      expect(tokens.accessToken).toBeTruthy();
      expect(tokens.refreshToken).toBeTruthy();
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
    });
  });

  describe('blacklistToken', () => {
    it('should blacklist a token', () => {
      const token = 'test_token';
      TokenService.blacklistToken(token);
      expect(TokenService.isBlacklisted(token)).toBe(true);
    });

    it('should return false for non-blacklisted token', () => {
      expect(TokenService.isBlacklisted('non_blacklisted_token')).toBe(false);
    });
  });

  describe('decodeToken', () => {
    it('should decode a token without verification', () => {
      const payload = {
        userId: 'user_123',
        email: 'test@example.com',
        role: UserRole.CUSTOMER,
      };

      const token = TokenService.generateAccessToken(payload);
      const decoded = TokenService.decodeToken(token);

      expect(decoded).toBeTruthy();
      expect(decoded?.userId).toBe(payload.userId);
      expect(decoded?.email).toBe(payload.email);
      expect(decoded?.role).toBe(payload.role);
    });

    it('should return null for invalid token', () => {
      const decoded = TokenService.decodeToken('invalid_token');
      expect(decoded).toBeNull();
    });
  });
});
