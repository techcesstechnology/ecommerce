import { hasPermission } from '../middleware/roles.middleware';
import { UserRole } from '../../config/auth.config';

describe('Roles Middleware', () => {
  describe('hasPermission', () => {
    it('should allow admin to perform any action on any resource', () => {
      expect(hasPermission(UserRole.ADMIN, 'products', 'create')).toBe(true);
      expect(hasPermission(UserRole.ADMIN, 'products', 'read')).toBe(true);
      expect(hasPermission(UserRole.ADMIN, 'products', 'update')).toBe(true);
      expect(hasPermission(UserRole.ADMIN, 'products', 'delete')).toBe(true);
      expect(hasPermission(UserRole.ADMIN, 'users', 'delete')).toBe(true);
      expect(hasPermission(UserRole.ADMIN, 'any-resource', 'create')).toBe(true);
    });

    it('should allow manager to manage products', () => {
      expect(hasPermission(UserRole.MANAGER, 'products', 'create')).toBe(true);
      expect(hasPermission(UserRole.MANAGER, 'products', 'read')).toBe(true);
      expect(hasPermission(UserRole.MANAGER, 'products', 'update')).toBe(true);
      expect(hasPermission(UserRole.MANAGER, 'products', 'delete')).toBe(true);
    });

    it('should allow manager to read and update orders', () => {
      expect(hasPermission(UserRole.MANAGER, 'orders', 'read')).toBe(true);
      expect(hasPermission(UserRole.MANAGER, 'orders', 'update')).toBe(true);
    });

    it('should not allow manager to create or delete orders', () => {
      expect(hasPermission(UserRole.MANAGER, 'orders', 'create')).toBe(false);
      expect(hasPermission(UserRole.MANAGER, 'orders', 'delete')).toBe(false);
    });

    it('should allow manager to read users', () => {
      expect(hasPermission(UserRole.MANAGER, 'users', 'read')).toBe(true);
    });

    it('should not allow manager to modify users', () => {
      expect(hasPermission(UserRole.MANAGER, 'users', 'create')).toBe(false);
      expect(hasPermission(UserRole.MANAGER, 'users', 'update')).toBe(false);
      expect(hasPermission(UserRole.MANAGER, 'users', 'delete')).toBe(false);
    });

    it('should allow driver to read and update deliveries', () => {
      expect(hasPermission(UserRole.DRIVER, 'deliveries', 'read')).toBe(true);
      expect(hasPermission(UserRole.DRIVER, 'deliveries', 'update')).toBe(true);
    });

    it('should not allow driver to create or delete deliveries', () => {
      expect(hasPermission(UserRole.DRIVER, 'deliveries', 'create')).toBe(false);
      expect(hasPermission(UserRole.DRIVER, 'deliveries', 'delete')).toBe(false);
    });

    it('should allow driver to read orders', () => {
      expect(hasPermission(UserRole.DRIVER, 'orders', 'read')).toBe(true);
    });

    it('should not allow driver to modify orders', () => {
      expect(hasPermission(UserRole.DRIVER, 'orders', 'create')).toBe(false);
      expect(hasPermission(UserRole.DRIVER, 'orders', 'update')).toBe(false);
      expect(hasPermission(UserRole.DRIVER, 'orders', 'delete')).toBe(false);
    });

    it('should allow customer to read products', () => {
      expect(hasPermission(UserRole.CUSTOMER, 'products', 'read')).toBe(true);
    });

    it('should not allow customer to modify products', () => {
      expect(hasPermission(UserRole.CUSTOMER, 'products', 'create')).toBe(false);
      expect(hasPermission(UserRole.CUSTOMER, 'products', 'update')).toBe(false);
      expect(hasPermission(UserRole.CUSTOMER, 'products', 'delete')).toBe(false);
    });

    it('should allow customer to create and read orders', () => {
      expect(hasPermission(UserRole.CUSTOMER, 'orders', 'create')).toBe(true);
      expect(hasPermission(UserRole.CUSTOMER, 'orders', 'read')).toBe(true);
    });

    it('should not allow customer to update or delete orders', () => {
      expect(hasPermission(UserRole.CUSTOMER, 'orders', 'update')).toBe(false);
      expect(hasPermission(UserRole.CUSTOMER, 'orders', 'delete')).toBe(false);
    });

    it('should allow customer to read and update their profile', () => {
      expect(hasPermission(UserRole.CUSTOMER, 'profile', 'read')).toBe(true);
      expect(hasPermission(UserRole.CUSTOMER, 'profile', 'update')).toBe(true);
    });

    it('should not allow customer to create or delete profile', () => {
      expect(hasPermission(UserRole.CUSTOMER, 'profile', 'create')).toBe(false);
      expect(hasPermission(UserRole.CUSTOMER, 'profile', 'delete')).toBe(false);
    });

    it('should not allow customer to access deliveries', () => {
      expect(hasPermission(UserRole.CUSTOMER, 'deliveries', 'create')).toBe(false);
      expect(hasPermission(UserRole.CUSTOMER, 'deliveries', 'read')).toBe(false);
      expect(hasPermission(UserRole.CUSTOMER, 'deliveries', 'update')).toBe(false);
      expect(hasPermission(UserRole.CUSTOMER, 'deliveries', 'delete')).toBe(false);
    });
  });
});
