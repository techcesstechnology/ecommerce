/**
 * User Service Integration Tests
 * Tests database interactions for user service
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

import { UserService } from '../../services/user.service';
import { initTestDatabase, cleanDatabase, closeTestDatabase } from '../utils/test-db';
import { buildUserWithHashedPassword } from '../fixtures/user.factory';
import { randomEmail } from '../utils/test-helpers';

describe('UserService Integration Tests', () => {
  let userService: UserService;

  beforeAll(async () => {
    await initTestDatabase();
    userService = new UserService();
  }, 30000);

  afterEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  }, 30000);

  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData = await buildUserWithHashedPassword({
        email: randomEmail(),
        name: 'John Doe',
        role: 'customer',
      });

      const user = await userService.createUser({
        email: userData.email!,
        name: userData.name!,
        password: userData.password!,
      });

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.role).toBe('customer');
    });

    it('should create user with default role as customer', async () => {
      const userData = await buildUserWithHashedPassword();

      const user = await userService.createUser({
        email: userData.email!,
        name: userData.name!,
        password: userData.password!,
      });

      expect(user.role).toBe('customer');
    });

    it('should create admin user when role is specified', async () => {
      const userData = await buildUserWithHashedPassword({ role: 'admin' });

      const user = await userService.createUser({
        email: userData.email!,
        name: userData.name!,
        password: userData.password!,
        role: 'admin',
      });

      expect(user.role).toBe('admin');
    });
  });

  describe('getUserById', () => {
    it('should fetch user by ID', async () => {
      const userData = await buildUserWithHashedPassword();
      const createdUser = await userService.createUser({
        email: userData.email!,
        name: userData.name!,
        password: userData.password!,
      });

      const user = await userService.getUserById(createdUser.id);

      expect(user).toBeDefined();
      expect(user?.id).toBe(createdUser.id);
      expect(user?.email).toBe(createdUser.email);
    });

    it('should return null for non-existent user', async () => {
      const user = await userService.getUserById('non-existent-id');
      expect(user).toBeNull();
    });
  });

  describe('getUserByEmail', () => {
    it('should fetch user by email', async () => {
      const userData = await buildUserWithHashedPassword();
      const createdUser = await userService.createUser({
        email: userData.email!,
        name: userData.name!,
        password: userData.password!,
      });

      const user = await userService.getUserByEmail(createdUser.email);

      expect(user).toBeDefined();
      expect(user?.email).toBe(createdUser.email);
    });

    it('should return null for non-existent email', async () => {
      const user = await userService.getUserByEmail('nonexistent@example.com');
      expect(user).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user data', async () => {
      const userData = await buildUserWithHashedPassword();
      const createdUser = await userService.createUser({
        email: userData.email!,
        name: userData.name!,
        password: userData.password!,
      });

      const updatedUser = await userService.updateUser(createdUser.id, {
        name: 'Updated Name',
        phone: '+263771234567',
      });

      expect(updatedUser).toBeDefined();
      expect(updatedUser?.name).toBe('Updated Name');
      expect(updatedUser?.phone).toBe('+263771234567');
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const userData = await buildUserWithHashedPassword();
      const createdUser = await userService.createUser({
        email: userData.email!,
        name: userData.name!,
        password: userData.password!,
      });

      const result = await userService.deleteUser(createdUser.id);
      expect(result).toBe(true);

      const deletedUser = await userService.getUserById(createdUser.id);
      expect(deletedUser).toBeNull();
    });

    it('should return false when deleting non-existent user', async () => {
      const result = await userService.deleteUser('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('getUsers', () => {
    it('should get all users', async () => {
      // Create multiple users
      for (let i = 0; i < 3; i++) {
        const userData = await buildUserWithHashedPassword();
        await userService.createUser({
          email: userData.email!,
          name: userData.name!,
          password: userData.password!,
        });
      }

      const result = await userService.getUsers();

      expect(result.users.length).toBe(3);
      expect(result.total).toBe(3);
    });

    it('should filter users by role', async () => {
      // Create users with different roles
      const customerData = await buildUserWithHashedPassword({ role: 'customer' });
      await userService.createUser({
        email: customerData.email!,
        name: customerData.name!,
        password: customerData.password!,
        role: 'customer',
      });

      const adminData = await buildUserWithHashedPassword({ role: 'admin' });
      await userService.createUser({
        email: adminData.email!,
        name: adminData.name!,
        password: adminData.password!,
        role: 'admin',
      });

      const result = await userService.getUsers({ role: 'admin' });

      expect(result.users.length).toBe(1);
      expect(result.users[0].role).toBe('admin');
    });

    it('should paginate users', async () => {
      // Create multiple users
      for (let i = 0; i < 5; i++) {
        const userData = await buildUserWithHashedPassword();
        await userService.createUser({
          email: userData.email!,
          name: userData.name!,
          password: userData.password!,
        });
      }

      const result = await userService.getUsers({ page: 1, limit: 2 });

      expect(result.users.length).toBe(2);
      expect(result.total).toBe(5);
    });
  });
});
