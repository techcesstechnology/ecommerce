/**
 * Rate Limiting Middleware Tests
 *
 * Tests for rate limiting functionality
 */

import request from 'supertest';
import express, { Application } from 'express';
import { loginRateLimiter, registrationRateLimiter, generalRateLimiter } from '../middleware/rate-limit.middleware';

describe('Rate Limiting Middleware', () => {
  let app: Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('Login Rate Limiter', () => {
    beforeEach(() => {
      app.post('/test-login', loginRateLimiter, (_req, res) => {
        res.status(200).json({ message: 'Success' });
      });
    });

    it('should allow requests within the rate limit', async () => {
      const response = await request(app)
        .post('/test-login')
        .send({ test: 'data' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Success');
    });

    it('should include rate limit headers', async () => {
      const response = await request(app)
        .post('/test-login')
        .send({ test: 'data' });

      expect(response.headers).toHaveProperty('ratelimit-limit');
      expect(response.headers).toHaveProperty('ratelimit-remaining');
      expect(response.headers).toHaveProperty('ratelimit-reset');
    });
  });

  describe('Registration Rate Limiter', () => {
    beforeEach(() => {
      app.post('/test-register', registrationRateLimiter, (_req, res) => {
        res.status(200).json({ message: 'Success' });
      });
    });

    it('should allow requests within the rate limit', async () => {
      const response = await request(app)
        .post('/test-register')
        .send({ test: 'data' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Success');
    });
  });

  describe('General Rate Limiter', () => {
    beforeEach(() => {
      app.get('/test-general', generalRateLimiter, (_req, res) => {
        res.status(200).json({ message: 'Success' });
      });
    });

    it('should allow requests within the rate limit', async () => {
      const response = await request(app).get('/test-general');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Success');
    });
  });
});
