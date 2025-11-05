/**
 * Monitoring Services Integration Tests
 */

import { apmService } from '../services/apm.service';
import { sentryService } from '../services/sentry.service';
import { analyticsService } from '../services/analytics.service';
import { LoggerService, generateCorrelationId } from '../services/logger.service';

describe('Monitoring Services', () => {
  describe('LoggerService', () => {
    it('should create logger instance', () => {
      const logger = new LoggerService('TestService');
      expect(logger).toBeDefined();
    });

    it('should generate correlation ID', () => {
      const correlationId = generateCorrelationId();
      expect(correlationId).toBeDefined();
      expect(typeof correlationId).toBe('string');
      expect(correlationId.length).toBeGreaterThan(0);
    });

    it('should set and get correlation ID', () => {
      const logger = new LoggerService('TestService');
      const correlationId = generateCorrelationId();
      logger.setCorrelationId(correlationId);
      expect(logger.getCorrelationId()).toBe(correlationId);
    });

    it('should log messages without errors', () => {
      const logger = new LoggerService('TestService');
      expect(() => {
        logger.info('Test message');
        logger.warn('Warning message');
        logger.debug('Debug message');
        logger.error('Error message', new Error('Test error'));
      }).not.toThrow();
    });
  });

  describe('APM Service', () => {
    it('should be defined', () => {
      expect(apmService).toBeDefined();
    });

    it('should check if enabled', () => {
      const enabled = apmService.isEnabled();
      expect(typeof enabled).toBe('boolean');
    });

    it('should start and end transaction', () => {
      const transactionId = apmService.startTransaction('TestTransaction', 'test');
      if (transactionId) {
        expect(transactionId).toBeDefined();
        expect(typeof transactionId).toBe('string');
        apmService.endTransaction(transactionId, true);
      }
    });

    it('should record metric without errors', () => {
      expect(() => {
        apmService.recordMetric({
          name: 'test_metric',
          value: 100,
          type: 'gauge',
        });
      }).not.toThrow();
    });

    it('should record error without throwing', () => {
      const error = new Error('Test error');
      expect(() => {
        apmService.recordError(error, 'test_transaction');
      }).not.toThrow();
    });
  });

  describe('Sentry Service', () => {
    it('should be defined', () => {
      expect(sentryService).toBeDefined();
    });

    it('should check if enabled', () => {
      const enabled = sentryService.isEnabled();
      expect(typeof enabled).toBe('boolean');
    });

    it('should capture exception without errors', () => {
      const error = new Error('Test error');
      expect(() => {
        sentryService.captureException(error, {
          tags: { test: 'true' },
        });
      }).not.toThrow();
    });

    it('should capture message without errors', () => {
      expect(() => {
        sentryService.captureMessage('Test message', 'info');
      }).not.toThrow();
    });

    it('should add breadcrumb without errors', () => {
      expect(() => {
        sentryService.addBreadcrumb({
          message: 'Test breadcrumb',
          category: 'test',
        });
      }).not.toThrow();
    });

    it('should set user without errors', () => {
      expect(() => {
        sentryService.setUser({
          id: 'test-user',
          email: 'test@example.com',
        });
        sentryService.clearUser();
      }).not.toThrow();
    });

    it('should set tags without errors', () => {
      expect(() => {
        sentryService.setTag('test', 'value');
        sentryService.setTags({ test1: 'value1', test2: 'value2' });
      }).not.toThrow();
    });
  });

  describe('Analytics Service', () => {
    it('should be defined', () => {
      expect(analyticsService).toBeDefined();
    });

    it('should check if enabled', () => {
      const enabled = analyticsService.isEnabled();
      expect(typeof enabled).toBe('boolean');
    });

    it('should track event without errors', async () => {
      await expect(
        analyticsService.trackEvent({
          eventName: 'Test Event',
          userId: 'test-user',
          properties: { test: 'value' },
        })
      ).resolves.not.toThrow();
    });

    it('should identify user without errors', async () => {
      await expect(
        analyticsService.identifyUser('test-user', {
          email: 'test@example.com',
          name: 'Test User',
        })
      ).resolves.not.toThrow();
    });

    it('should track ecommerce events without errors', async () => {
      const testUserId = 'test-user';
      const productData = {
        productId: 'prod-123',
        productName: 'Test Product',
        price: 99.99,
        quantity: 1,
      };

      await expect(
        analyticsService.trackProductViewed(testUserId, productData)
      ).resolves.not.toThrow();

      await expect(
        analyticsService.trackProductAddedToCart(testUserId, productData)
      ).resolves.not.toThrow();

      await expect(
        analyticsService.trackCheckoutStarted(testUserId, {
          orderId: 'order-123',
          revenue: 99.99,
        })
      ).resolves.not.toThrow();

      await expect(
        analyticsService.trackOrderCompleted(testUserId, {
          orderId: 'order-123',
          revenue: 99.99,
        })
      ).resolves.not.toThrow();
    });

    it('should track user activity events without errors', async () => {
      const testUserId = 'test-user';

      await expect(analyticsService.trackSignup(testUserId)).resolves.not.toThrow();
      await expect(analyticsService.trackLogin(testUserId)).resolves.not.toThrow();
      await expect(analyticsService.trackLogout(testUserId)).resolves.not.toThrow();
    });

    it('should track search without errors', async () => {
      await expect(
        analyticsService.trackSearch('test-user', 'test query', 10)
      ).resolves.not.toThrow();
    });

    it('should get queue size', () => {
      const queueSize = analyticsService.getQueueSize();
      expect(typeof queueSize).toBe('number');
      expect(queueSize).toBeGreaterThanOrEqual(0);
    });

    it('should flush and clear queue', async () => {
      await analyticsService.flush();
      analyticsService.clearQueue();
      expect(analyticsService.getQueueSize()).toBe(0);
    });
  });
});
