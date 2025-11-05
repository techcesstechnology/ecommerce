/**
 * Express Request Extensions
 * Type definitions for custom properties added to Express Request
 */

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      correlationId?: string;
      transactionId?: string;
      startTime?: number;
      monitoringLogger?: import('../services/logger.service').LoggerService;
    }
  }
}

export {};
