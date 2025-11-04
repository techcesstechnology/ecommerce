/**
 * User Model Tests
 *
 * Tests for TypeORM User entity methods
 */

import { User } from '../models/user.model';
import { UserRole } from '@freshroute/shared';

describe('User Model', () => {
  describe('Password Management', () => {
    it('should create a user with required fields', () => {
      const user = new User();
      user.email = 'test@example.com';
      user.password = 'testpassword';
      user.firstName = 'John';
      user.lastName = 'Doe';
      user.role = UserRole.CUSTOMER;

      expect(user.email).toBe('test@example.com');
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.role).toBe(UserRole.CUSTOMER);
    });

    it('should hash password on insert', async () => {
      const user = new User();
      user.password = 'plainpassword';

      await user.hashPasswordBeforeInsert();

      expect(user.password).not.toBe('plainpassword');
      expect(user.password.startsWith('$2')).toBe(true); // bcrypt hashes start with $2
    });

    it('should compare passwords correctly', async () => {
      const user = new User();
      user.password = 'mypassword';
      await user.hashPasswordBeforeInsert();

      const isValid = await user.comparePassword('mypassword');
      const isInvalid = await user.comparePassword('wrongpassword');

      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
    });
  });

  describe('Refresh Token Management', () => {
    it('should set and verify refresh token', async () => {
      const user = new User();
      const refreshToken = 'test-refresh-token-123';

      await user.setRefreshToken(refreshToken);

      expect(user.refreshToken).toBeDefined();
      expect(user.refreshToken).not.toBe(refreshToken); // Should be hashed

      const isValid = await user.verifyRefreshToken(refreshToken);
      expect(isValid).toBe(true);

      const isInvalid = await user.verifyRefreshToken('wrong-token');
      expect(isInvalid).toBe(false);
    });

    it('should clear refresh token', async () => {
      const user = new User();
      await user.setRefreshToken('test-token');

      expect(user.refreshToken).toBeDefined();

      user.clearRefreshToken();

      expect(user.refreshToken).toBeUndefined();
    });

    it('should return false when verifying token with no stored token', async () => {
      const user = new User();

      const isValid = await user.verifyRefreshToken('any-token');
      expect(isValid).toBe(false);
    });
  });
});
