/**
 * Authentication API Endpoint Tests
 * Tests API endpoints for authentication
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

import request from 'supertest';
import express, { Application } from 'express';
import authRoutes from '../../routes/auth.routes';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { initTestDatabase, cleanDatabase, closeTestDatabase } from '../utils/test-db';
import { buildUserWithHashedPassword } from '../fixtures/user.factory';
import { randomEmail } from '../utils/test-helpers';
import { errorHandler } from '../../middleware/error-handler.middleware';

describe('Authentication API Tests', () => {
  let app: Application;
  let userService: UserService;
  let authService: AuthService;

  beforeAll(async () => {
    await initTestDatabase();
    userService = new UserService();
    authService = new AuthService();

    // Setup express app for testing
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use(errorHandler);
  }, 30000);

  afterEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  }, 30000);

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: randomEmail(),
        name: 'Test User',
        password: 'TestPassword123!',
        phone: '+263771234567',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.name).toBe(userData.name);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should return 400 for invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        name: 'Test User',
        password: 'TestPassword123!',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('email');
    });

    it('should return 400 for weak password', async () => {
      const userData = {
        email: randomEmail(),
        name: 'Test User',
        password: 'weak',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('password');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    it('should return 409 for duplicate email', async () => {
      const userData = {
        email: randomEmail(),
        name: 'Test User',
        password: 'TestPassword123!',
      };

      // Register first user
      await request(app).post('/api/auth/register').send(userData).expect(201);

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser: any;
    const password = 'TestPassword123!';

    beforeEach(async () => {
      const userData = await buildUserWithHashedPassword({ password });
      testUser = await userService.createUser({
        email: userData.email!,
        name: userData.name!,
        password: userData.password!,
      });
    });

    it('should login user with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: password,
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should return 401 for incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body.status).toBe('error');
    });

    it('should return 401 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: password,
        })
        .expect(401);

      expect(response.body.status).toBe('error');
    });

    it('should return 400 for missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/auth/refresh', () => {
    let testUser: any;
    let refreshToken: string;

    beforeEach(async () => {
      const userData = await buildUserWithHashedPassword();
      testUser = await userService.createUser({
        email: userData.email!,
        name: userData.name!,
        password: userData.password!,
      });

      // Generate refresh token
      refreshToken = authService.generateRefreshToken({
        userId: testUser.id,
        email: testUser.email,
        role: testUser.role,
      });
    });

    it('should refresh access token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`refreshToken=${refreshToken}`])
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should return 401 for missing refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .expect(401);

      expect(response.body.status).toBe('error');
    });

    it('should return 401 for invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', ['refreshToken=invalid-token'])
        .expect(401);

      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/auth/logout', () => {
    let testUser: any;
    let accessToken: string;

    beforeEach(async () => {
      const userData = await buildUserWithHashedPassword();
      testUser = await userService.createUser({
        email: userData.email!,
        name: userData.name!,
        password: userData.password!,
      });

      // Generate access token
      accessToken = authService.generateAccessToken({
        userId: testUser.id,
        email: testUser.email,
        role: testUser.role,
      });
    });

    it('should logout user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/auth/me', () => {
    let testUser: any;
    let accessToken: string;

    beforeEach(async () => {
      const userData = await buildUserWithHashedPassword();
      testUser = await userService.createUser({
        email: userData.email!,
        name: userData.name!,
        password: userData.password!,
      });

      // Generate access token
      accessToken = authService.generateAccessToken({
        userId: testUser.id,
        email: testUser.email,
        role: testUser.role,
      });
    });

    it('should get current user profile', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.email).toBe(testUser.email);
      expect(response.body.data.name).toBe(testUser.name);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.status).toBe('error');
    });
  });
});
