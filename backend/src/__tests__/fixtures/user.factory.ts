/**
 * User Test Factory
 * Factory functions for creating test user data
 */

import { User } from '../../models/user.entity';
import { AuthService } from '../../services/auth.service';
import { randomEmail, randomPhone, randomString } from '../utils/test-helpers';

const authService = new AuthService();

export interface UserFactoryOptions {
  email?: string;
  name?: string;
  password?: string;
  phone?: string;
  role?: 'customer' | 'admin' | 'vendor';
  isActive?: boolean;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
}

/**
 * Create user data without saving to database
 */
export function buildUser(options: UserFactoryOptions = {}): Partial<User> {
  return {
    email: options.email || randomEmail(),
    name: options.name || `Test User ${randomString(5)}`,
    password: options.password || 'TestPassword123!',
    phone: options.phone || randomPhone(),
    role: options.role || 'customer',
    isActive: options.isActive !== undefined ? options.isActive : true,
    emailVerified: options.emailVerified || false,
    twoFactorEnabled: options.twoFactorEnabled || false,
    failedLoginAttempts: 0,
  };
}

/**
 * Create user with hashed password
 */
export async function buildUserWithHashedPassword(
  options: UserFactoryOptions = {}
): Promise<Partial<User>> {
  const user = buildUser(options);
  if (user.password) {
    user.password = await authService.hashPassword(user.password);
  }
  return user;
}

/**
 * Create admin user data
 */
export function buildAdminUser(options: Omit<UserFactoryOptions, 'role'> = {}): Partial<User> {
  return buildUser({
    ...options,
    role: 'admin',
    emailVerified: true,
  });
}

/**
 * Create vendor user data
 */
export function buildVendorUser(options: Omit<UserFactoryOptions, 'role'> = {}): Partial<User> {
  return buildUser({
    ...options,
    role: 'vendor',
    emailVerified: true,
  });
}

/**
 * Create customer user data
 */
export function buildCustomerUser(options: Omit<UserFactoryOptions, 'role'> = {}): Partial<User> {
  return buildUser({
    ...options,
    role: 'customer',
  });
}
