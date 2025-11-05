/**
 * Performance Tests for API Endpoints
 * Tests load, stress, and response times
 */

import { performLoadTest, benchmarkResponseTime } from '../utils/performance.utils';

describe('API Performance Tests', () => {
  const baseURL = process.env.BASE_URL || 'http://localhost:3000';

  describe('Health Endpoint Performance', () => {
    it('should handle concurrent requests', async () => {
      const metrics = await performLoadTest({
        url: `${baseURL}/api/health`,
        method: 'GET',
        concurrentUsers: 50,
        requestsPerUser: 10,
      });

      expect(metrics.successfulRequests).toBeGreaterThan(0);
      expect(metrics.averageResponseTime).toBeLessThan(1000); // Less than 1 second
      expect(metrics.requestsPerSecond).toBeGreaterThan(10);
    }, 60000);

    it('should meet response time benchmarks', async () => {
      const benchmarks = await benchmarkResponseTime(
        `${baseURL}/api/health`,
        100
      );

      expect(benchmarks.average).toBeLessThan(500); // Average < 500ms
      expect(benchmarks.p95).toBeLessThan(1000); // 95th percentile < 1s
      expect(benchmarks.p99).toBeLessThan(2000); // 99th percentile < 2s
    }, 60000);
  });

  describe('Authentication Endpoint Performance', () => {
    it('should handle login requests under load', async () => {
      const metrics = await performLoadTest({
        url: `${baseURL}/api/auth/login`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          email: 'test@example.com',
          password: 'TestPassword123!',
        },
        concurrentUsers: 20,
        requestsPerUser: 5,
      });

      expect(metrics.totalRequests).toBe(100);
      expect(metrics.averageResponseTime).toBeLessThan(2000); // Less than 2 seconds
    }, 60000);
  });

  describe('Registration Endpoint Performance', () => {
    it('should handle registration requests', async () => {
      const timestamp = Date.now();
      const metrics = await performLoadTest({
        url: `${baseURL}/api/auth/register`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          email: `test-${timestamp}@example.com`,
          name: 'Performance Test User',
          password: 'TestPassword123!',
        },
        concurrentUsers: 10,
        requestsPerUser: 3,
      });

      expect(metrics.totalRequests).toBe(30);
      expect(metrics.averageResponseTime).toBeLessThan(3000); // Less than 3 seconds
    }, 60000);
  });
});
