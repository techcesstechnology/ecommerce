/**
 * Monitoring Usage Examples
 * 
 * This file demonstrates how to use the monitoring, logging, and analytics
 * services in your application code.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { apmService } from '../services/apm.service';
import { sentryService } from '../services/sentry.service';
import { analyticsService } from '../services/analytics.service';
import { LoggerService } from '../services/logger.service';

const router = Router();

/**
 * Example 1: Basic route with monitoring
 */
router.get('/example/basic', async (req: Request, res: Response, next: NextFunction) => {
  // Use the logger attached to the request
  const logger = req.monitoringLogger || new LoggerService('ExampleRoute');
  
  try {
    logger.info('Processing basic request', {
      user_id: (req as any).user?.id,
      ip: req.ip,
    });

    // Your business logic here
    const result = { message: 'Success' };

    res.json(result);
  } catch (error) {
    logger.error('Error in basic route', error as Error);
    next(error);
  }
});

/**
 * Example 2: Route with full monitoring stack
 */
router.post('/example/complete', async (req: Request, res: Response, next: NextFunction) => {
  const logger = req.monitoringLogger || new LoggerService('CompleteExample');
  
  // Start APM transaction for this operation
  const transactionId = apmService.startTransaction('ProcessCompleteExample', 'background', {
    correlation_id: req.correlationId,
    user_id: (req as any).user?.id,
  });

  try {
    // Add Sentry breadcrumb
    sentryService.addBreadcrumb({
      message: 'Starting complete example processing',
      category: 'business-logic',
      data: {
        items_count: req.body.items?.length,
      },
    });

    // Set Sentry user context
    if ((req as any).user) {
      sentryService.setUser({
        id: (req as any).user.id,
        email: (req as any).user.email,
      });
    }

    // Simulate some processing
    logger.info('Processing items', {
      metadata: {
        count: req.body.items?.length,
      },
    });

    // Record custom metric
    apmService.recordMetric({
      name: 'items_processed',
      value: req.body.items?.length || 0,
      type: 'gauge',
      tags: {
        endpoint: '/example/complete',
      },
    });

    // Track analytics event
    await analyticsService.trackEvent({
      eventName: 'Complete Example Processed',
      userId: (req as any).user?.id,
      properties: {
        items_count: req.body.items?.length,
        correlation_id: req.correlationId,
      },
    });

    // End transaction successfully
    apmService.endTransaction(transactionId, true, {
      items_processed: req.body.items?.length,
    });

    res.json({ success: true });
  } catch (error) {
    // Track error in all monitoring systems
    logger.error('Error in complete example', error as Error, {
      user_id: (req as any).user?.id,
    });

    apmService.recordError(error as Error, transactionId);

    sentryService.captureException(error as Error, {
      tags: {
        endpoint: '/example/complete',
        correlation_id: req.correlationId || 'unknown',
      },
      extra: {
        request_body: req.body,
      },
    });

    await analyticsService.trackError((req as any).user?.id, error as Error, {
      endpoint: '/example/complete',
    });

    // End transaction with failure
    apmService.endTransaction(transactionId, false);

    next(error);
  }
});

/**
 * Example 3: E-commerce order processing with monitoring
 */
router.post('/example/order', async (req: Request, res: Response, next: NextFunction) => {
  const logger = req.monitoringLogger || new LoggerService('OrderExample');
  const userId = (req as any).user?.id || 'guest';

  // Start transaction
  const transactionId = apmService.startTransaction('ProcessOrder', 'order', {
    correlation_id: req.correlationId,
    user_id: userId,
  });

  try {
    // Add breadcrumbs for debugging
    sentryService.addBreadcrumb({
      message: 'Order processing started',
      category: 'order',
      data: {
        order_total: req.body.total,
        items_count: req.body.items?.length,
      },
    });

    logger.info('Processing order', {
      metadata: {
        order_total: req.body.total,
        items: req.body.items?.length,
      },
      user_id: userId,
    });

    // Simulate order creation
    const orderId = `order_${Date.now()}`;

    // Track checkout started
    await analyticsService.trackCheckoutStarted(userId, {
      orderId,
      revenue: req.body.total,
      currency: 'USD',
      items: req.body.items,
    });

    // Add breadcrumb for payment processing
    sentryService.addBreadcrumb({
      message: 'Processing payment',
      category: 'payment',
      data: {
        order_id: orderId,
        amount: req.body.total,
      },
    });

    // Simulate payment processing
    // ... payment logic here ...

    // Track order completed
    await analyticsService.trackOrderCompleted(userId, {
      orderId,
      revenue: req.body.total,
      tax: req.body.tax,
      shipping: req.body.shipping,
      currency: 'USD',
      paymentMethod: req.body.paymentMethod,
    });

    // Record metrics
    apmService.recordMetric({
      name: 'order_revenue',
      value: req.body.total,
      type: 'histogram',
      tags: {
        payment_method: req.body.paymentMethod,
      },
    });

    // Set transaction attributes
    apmService.setTransactionAttribute(transactionId, 'order_id', orderId);
    apmService.setTransactionAttribute(transactionId, 'order_total', req.body.total);

    // End transaction successfully
    apmService.endTransaction(transactionId, true, {
      order_id: orderId,
      revenue: req.body.total,
    });

    logger.info('Order processed successfully', {
      metadata: {
        order_id: orderId,
      },
      user_id: userId,
    });

    res.json({ success: true, orderId });
  } catch (error) {
    // Comprehensive error tracking
    logger.error('Order processing failed', error as Error, {
      user_id: userId,
      metadata: {
        order_data: req.body,
      },
    });

    apmService.recordError(error as Error, transactionId);

    sentryService.captureException(error as Error, {
      tags: {
        feature: 'order',
        payment_method: req.body.paymentMethod,
      },
      extra: {
        order_data: req.body,
        user_id: userId,
      },
    });

    await analyticsService.trackPaymentFailed(userId, {
      amount: req.body.total,
      payment_method: req.body.paymentMethod,
      error_message: (error as Error).message,
    });

    apmService.endTransaction(transactionId, false);

    next(error);
  }
});

/**
 * Example 4: Background job with monitoring
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processBackgroundJob(jobId: string, data: any): Promise<void> {
  const logger = new LoggerService('BackgroundJob');
  
  // Start transaction for background job
  const transactionId = apmService.startTransaction(`BackgroundJob:${jobId}`, 'background', {
    job_id: jobId,
  });

  try {
    logger.info('Background job started', {
      metadata: {
        job_id: jobId,
        data_size: JSON.stringify(data).length,
      },
    });

    // Add breadcrumb
    sentryService.addBreadcrumb({
      message: 'Background job processing',
      category: 'background',
      data: { job_id: jobId },
    });

    // Simulate job processing
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Record job completion metric
    apmService.recordMetric({
      name: 'background_jobs_completed',
      value: 1,
      type: 'counter',
      tags: {
        job_type: 'example',
      },
    });

    // End transaction
    apmService.endTransaction(transactionId, true);

    logger.info('Background job completed', {
      metadata: { job_id: jobId },
    });
  } catch (error) {
    logger.error('Background job failed', error as Error, {
      metadata: { job_id: jobId },
    });

    apmService.recordError(error as Error, transactionId);

    sentryService.captureException(error as Error, {
      tags: { job_id: jobId, job_type: 'background' },
      extra: { data },
    });

    apmService.endTransaction(transactionId, false);

    throw error;
  }
}

/**
 * Example 5: Monitoring performance-critical operations
 */
router.get('/example/performance', async (req: Request, res: Response) => {
  const logger = req.monitoringLogger || new LoggerService('Performance');
  const startTime = Date.now();

  try {
    // Simulate expensive operation
    await new Promise((resolve) => setTimeout(resolve, 100));

    const duration = Date.now() - startTime;

    // Record performance metric
    apmService.recordMetric({
      name: 'expensive_operation_duration',
      value: duration,
      type: 'histogram',
      tags: {
        operation: 'example',
      },
    });

    // Log performance warning if slow
    if (duration > 500) {
      logger.warn('Slow operation detected', {
        metadata: {
          duration,
          threshold: 500,
        },
      });

      sentryService.captureMessage('Slow operation detected', 'warning', {
        tags: { operation: 'example' },
        extra: { duration },
      });
    }

    res.json({ duration });
  } catch (error) {
    logger.error('Performance example failed', error as Error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
export { processBackgroundJob };
