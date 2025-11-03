import {
  validate,
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../validators/auth.validator';
import { UserRole } from '../../config/auth.config';

describe('Auth Validators', () => {
  describe('registerSchema', () => {
    it('should validate valid registration data', () => {
      const data = {
        email: 'test@example.com',
        password: 'Test123!@#',
        role: UserRole.CUSTOMER,
      };

      const result = validate(registerSchema, data);

      expect(result).toEqual(data);
    });

    it('should validate registration without role', () => {
      const data = {
        email: 'test@example.com',
        password: 'Test123!@#',
      };

      const result = validate<{ email: string; password: string }>(registerSchema, data);

      expect(result.email).toBe(data.email);
      expect(result.password).toBe(data.password);
    });

    it('should throw error for invalid email', () => {
      const data = {
        email: 'invalid-email',
        password: 'Test123!@#',
      };

      expect(() => validate(registerSchema, data)).toThrow('valid email');
    });

    it('should throw error for missing email', () => {
      const data = {
        password: 'Test123!@#',
      };

      expect(() => validate(registerSchema, data)).toThrow('Email is required');
    });

    it('should throw error for weak password', () => {
      const data = {
        email: 'test@example.com',
        password: 'weak',
      };

      expect(() => validate(registerSchema, data)).toThrow('at least 8 characters');
    });

    it('should throw error for password without uppercase', () => {
      const data = {
        email: 'test@example.com',
        password: 'test123!@#',
      };

      expect(() => validate(registerSchema, data)).toThrow('uppercase letter');
    });

    it('should throw error for password without lowercase', () => {
      const data = {
        email: 'test@example.com',
        password: 'TEST123!@#',
      };

      expect(() => validate(registerSchema, data)).toThrow('lowercase letter');
    });

    it('should throw error for password without number', () => {
      const data = {
        email: 'test@example.com',
        password: 'TestTest!@#',
      };

      expect(() => validate(registerSchema, data)).toThrow('number');
    });

    it('should throw error for password without special character', () => {
      const data = {
        email: 'test@example.com',
        password: 'Test123456',
      };

      expect(() => validate(registerSchema, data)).toThrow('special character');
    });

    it('should throw error for invalid role', () => {
      const data = {
        email: 'test@example.com',
        password: 'Test123!@#',
        role: 'INVALID_ROLE',
      };

      expect(() => validate(registerSchema, data)).toThrow('Invalid role');
    });
  });

  describe('loginSchema', () => {
    it('should validate valid login data', () => {
      const data = {
        email: 'test@example.com',
        password: 'Test123!@#',
      };

      const result = validate(loginSchema, data);

      expect(result).toEqual(data);
    });

    it('should throw error for invalid email', () => {
      const data = {
        email: 'invalid-email',
        password: 'Test123!@#',
      };

      expect(() => validate(loginSchema, data)).toThrow('valid email');
    });

    it('should throw error for missing password', () => {
      const data = {
        email: 'test@example.com',
      };

      expect(() => validate(loginSchema, data)).toThrow('Password is required');
    });
  });

  describe('refreshTokenSchema', () => {
    it('should validate valid refresh token data', () => {
      const data = {
        refreshToken: 'valid_token_here',
      };

      const result = validate(refreshTokenSchema, data);

      expect(result).toEqual(data);
    });

    it('should throw error for missing refresh token', () => {
      const data = {};

      expect(() => validate(refreshTokenSchema, data)).toThrow(
        'Refresh token is required'
      );
    });
  });

  describe('requestPasswordResetSchema', () => {
    it('should validate valid password reset request', () => {
      const data = {
        email: 'test@example.com',
      };

      const result = validate(requestPasswordResetSchema, data);

      expect(result).toEqual(data);
    });

    it('should throw error for invalid email', () => {
      const data = {
        email: 'invalid-email',
      };

      expect(() => validate(requestPasswordResetSchema, data)).toThrow('valid email');
    });

    it('should throw error for missing email', () => {
      const data = {};

      expect(() => validate(requestPasswordResetSchema, data)).toThrow(
        'Email is required'
      );
    });
  });

  describe('resetPasswordSchema', () => {
    it('should validate valid password reset data', () => {
      const data = {
        token: 'valid_token',
        password: 'NewTest123!@#',
      };

      const result = validate(resetPasswordSchema, data);

      expect(result).toEqual(data);
    });

    it('should throw error for missing token', () => {
      const data = {
        password: 'NewTest123!@#',
      };

      expect(() => validate(resetPasswordSchema, data)).toThrow(
        'Reset token is required'
      );
    });

    it('should throw error for weak password', () => {
      const data = {
        token: 'valid_token',
        password: 'weak',
      };

      expect(() => validate(resetPasswordSchema, data)).toThrow('at least 8 characters');
    });
  });

  describe('verifyEmailSchema', () => {
    it('should validate valid email verification data', () => {
      const data = {
        token: 'valid_token',
      };

      const result = validate(verifyEmailSchema, data);

      expect(result).toEqual(data);
    });

    it('should throw error for missing token', () => {
      const data = {};

      expect(() => validate(verifyEmailSchema, data)).toThrow(
        'Verification token is required'
      );
    });
  });
});
