/**
 * APM (Application Performance Monitoring) Service
 * Abstract service for tracking application performance metrics
 * Designed to work with various APM providers (New Relic, DataDog, etc.)
 */

import { getConfig } from '../config';
import { logger } from './logger.service';

const config = getConfig();
const apmConfig = config.getApmConfig();

/**
 * Transaction interface for tracking operations
 */
export interface Transaction {
  id: string;
  name: string;
  type: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
  tags?: Record<string, string>;
}

/**
 * Metric interface for custom metrics
 */
export interface Metric {
  name: string;
  value: number;
  type: 'gauge' | 'counter' | 'histogram';
  tags?: Record<string, string>;
  timestamp?: Date;
}

/**
 * APM Service class
 */
export class ApmService {
  private enabled: boolean;
  private transactions: Map<string, Transaction>;
  private metrics: Metric[];

  constructor() {
    this.enabled = apmConfig.enabled;
    this.transactions = new Map();
    this.metrics = [];

    if (this.enabled) {
      logger.info('APM Service initialized', {
        service: apmConfig.serviceName,
        environment: apmConfig.environment,
      });
    }
  }

  /**
   * Check if APM is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Start a new transaction
   */
  startTransaction(name: string, type: string = 'request', metadata?: Record<string, any>): string {
    if (!this.enabled) return '';

    const transactionId = this.generateTransactionId();
    const transaction: Transaction = {
      id: transactionId,
      name,
      type,
      startTime: Date.now(),
      metadata,
      tags: {
        service: apmConfig.serviceName,
        environment: apmConfig.environment,
        ...apmConfig.tags,
      },
    };

    this.transactions.set(transactionId, transaction);

    logger.debug(`Transaction started: ${name}`, {
      transaction_id: transactionId,
      type,
    });

    return transactionId;
  }

  /**
   * End a transaction
   */
  endTransaction(
    transactionId: string,
    success: boolean = true,
    metadata?: Record<string, any>
  ): void {
    if (!this.enabled || !transactionId) return;

    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      logger.warn(`Transaction not found: ${transactionId}`);
      return;
    }

    transaction.endTime = Date.now();
    transaction.duration = transaction.endTime - transaction.startTime;

    if (metadata) {
      transaction.metadata = { ...transaction.metadata, ...metadata };
    }

    logger.debug(`Transaction ended: ${transaction.name}`, {
      transaction_id: transactionId,
      duration: transaction.duration,
      success,
    });

    // In a real implementation, you would send this to your APM provider here
    // For example: newrelic.endTransaction() or datadogTrace.finish()

    // Clean up
    this.transactions.delete(transactionId);
  }

  /**
   * Record a custom metric
   */
  recordMetric(metric: Metric): void {
    if (!this.enabled) return;

    const metricWithTimestamp: Metric = {
      ...metric,
      timestamp: metric.timestamp || new Date(),
      tags: {
        service: apmConfig.serviceName,
        environment: apmConfig.environment,
        ...metric.tags,
      },
    };

    this.metrics.push(metricWithTimestamp);

    logger.debug(`Metric recorded: ${metric.name}`, {
      value: metric.value,
      type: metric.type,
    });

    // In a real implementation, send to APM provider
    // For example: newrelic.recordMetric() or statsd.gauge()
  }

  /**
   * Set custom transaction attribute
   */
  setTransactionAttribute(transactionId: string, key: string, value: any): void {
    if (!this.enabled || !transactionId) return;

    const transaction = this.transactions.get(transactionId);
    if (!transaction) return;

    if (!transaction.metadata) {
      transaction.metadata = {};
    }

    transaction.metadata[key] = value;
  }

  /**
   * Add transaction tag
   */
  addTransactionTag(transactionId: string, key: string, value: string): void {
    if (!this.enabled || !transactionId) return;

    const transaction = this.transactions.get(transactionId);
    if (!transaction) return;

    if (!transaction.tags) {
      transaction.tags = {};
    }

    transaction.tags[key] = value;
  }

  /**
   * Record error in transaction
   */
  recordError(error: Error, transactionId?: string): void {
    if (!this.enabled) return;

    logger.error(`Error recorded in APM: ${error.message}`, error, {
      transaction_id: transactionId,
      error_name: error.name,
    });

    // In a real implementation, send error to APM provider
    // For example: newrelic.noticeError() or Sentry.captureException()
  }

  /**
   * Generate transaction ID
   */
  private generateTransactionId(): string {
    return `txn_${Date.now()}_${crypto.randomUUID().substring(0, 8)}`;
  }

  /**
   * Get all active transactions (for debugging)
   */
  getActiveTransactions(): Transaction[] {
    return Array.from(this.transactions.values());
  }

  /**
   * Get metrics count (for debugging)
   */
  getMetricsCount(): number {
    return this.metrics.length;
  }

  /**
   * Clear old metrics (should be called periodically)
   */
  clearMetrics(): void {
    this.metrics = [];
  }
}

/**
 * Export singleton instance
 */
export const apmService = new ApmService();

/**
 * Export default
 */
export default apmService;
