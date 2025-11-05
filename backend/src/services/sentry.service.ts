/**
 * Sentry Error Tracking Service
 * Integration with Sentry for error tracking, monitoring, and performance
 */

import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { getConfig } from '../config';
import { logger } from './logger.service';
import { Request } from 'express';
import crypto from 'crypto';

const config = getConfig();
const sentryConfig = config.getSentryConfig();

/**
 * Error context interface
 */
export interface ErrorContext {
  user?: {
    id?: string;
    email?: string;
    username?: string;
  };
  tags?: Record<string, string>;
  extra?: Record<string, any>;
  level?: Sentry.SeverityLevel;
}

/**
 * Breadcrumb interface
 */
export interface Breadcrumb {
  message: string;
  category?: string;
  level?: Sentry.SeverityLevel;
  data?: Record<string, any>;
}

/**
 * Sentry Service class
 */
export class SentryService {
  private enabled: boolean;
  private initialized: boolean = false;

  constructor() {
    this.enabled = sentryConfig.enabled && !!sentryConfig.dsn;

    if (this.enabled) {
      this.initialize();
    }
  }

  /**
   * Initialize Sentry
   */
  private initialize(): void {
    if (this.initialized) return;

    try {
      Sentry.init({
        dsn: sentryConfig.dsn,
        environment: sentryConfig.environment,
        release: sentryConfig.release,
        tracesSampleRate: sentryConfig.tracesSampleRate,
        profilesSampleRate: sentryConfig.profilesSampleRate,

        integrations: [nodeProfilingIntegration()],

        // Filter out known operational errors
        beforeSend(event) {
          // Don't send errors that are in the ignore list
          if (event.exception?.values?.[0]?.type) {
            const errorType = event.exception.values[0].type;
            if (sentryConfig.ignoreErrors.includes(errorType)) {
              return null;
            }
          }

          return event;
        },

        // Filter breadcrumbs
        beforeBreadcrumb(breadcrumb) {
          // Filter out sensitive data from breadcrumbs
          if (breadcrumb.data?.password) {
            delete breadcrumb.data.password;
          }
          if (breadcrumb.data?.token) {
            delete breadcrumb.data.token;
          }
          return breadcrumb;
        },
      });

      this.initialized = true;
      logger.info('Sentry initialized successfully', {
        environment: sentryConfig.environment,
        release: sentryConfig.release,
      });
    } catch (error) {
      logger.error('Failed to initialize Sentry', error as Error);
      this.enabled = false;
    }
  }

  /**
   * Check if Sentry is enabled
   */
  isEnabled(): boolean {
    return this.enabled && this.initialized;
  }

  /**
   * Capture exception
   */
  captureException(error: Error, context?: ErrorContext): string | undefined {
    if (!this.isEnabled()) return undefined;

    try {
      // Set context if provided
      if (context) {
        if (context.user) {
          Sentry.setUser(context.user);
        }
        if (context.tags) {
          Sentry.setTags(context.tags);
        }
        if (context.extra) {
          Sentry.setExtras(context.extra);
        }
      }

      const eventId = Sentry.captureException(error);

      logger.debug('Exception captured by Sentry', {
        event_id: eventId,
        error_name: error.name,
        error_message: error.message,
      });

      return eventId;
    } catch (err) {
      logger.error('Failed to capture exception in Sentry', err as Error);
      return undefined;
    }
  }

  /**
   * Capture message
   */
  captureMessage(
    message: string,
    level: Sentry.SeverityLevel = 'info',
    context?: ErrorContext
  ): string | undefined {
    if (!this.isEnabled()) return undefined;

    try {
      if (context) {
        if (context.user) Sentry.setUser(context.user);
        if (context.tags) Sentry.setTags(context.tags);
        if (context.extra) Sentry.setExtras(context.extra);
      }

      const eventId = Sentry.captureMessage(message, level);

      logger.debug('Message captured by Sentry', {
        event_id: eventId,
        level,
      });

      return eventId;
    } catch (err) {
      logger.error('Failed to capture message in Sentry', err as Error);
      return undefined;
    }
  }

  /**
   * Add breadcrumb
   */
  addBreadcrumb(breadcrumb: Breadcrumb): void {
    if (!this.isEnabled()) return;

    try {
      Sentry.addBreadcrumb({
        message: breadcrumb.message,
        category: breadcrumb.category || 'custom',
        level: breadcrumb.level || 'info',
        data: breadcrumb.data,
        timestamp: Date.now() / 1000,
      });
    } catch (err) {
      logger.error('Failed to add breadcrumb to Sentry', err as Error);
    }
  }

  /**
   * Set user context
   */
  setUser(user: { id?: string; email?: string; username?: string; [key: string]: any }): void {
    if (!this.isEnabled()) return;

    try {
      Sentry.setUser(user);
    } catch (err) {
      logger.error('Failed to set user in Sentry', err as Error);
    }
  }

  /**
   * Clear user context
   */
  clearUser(): void {
    if (!this.isEnabled()) return;

    try {
      Sentry.setUser(null);
    } catch (err) {
      logger.error('Failed to clear user in Sentry', err as Error);
    }
  }

  /**
   * Set tag
   */
  setTag(key: string, value: string): void {
    if (!this.isEnabled()) return;

    try {
      Sentry.setTag(key, value);
    } catch (err) {
      logger.error('Failed to set tag in Sentry', err as Error);
    }
  }

  /**
   * Set tags
   */
  setTags(tags: Record<string, string>): void {
    if (!this.isEnabled()) return;

    try {
      Sentry.setTags(tags);
    } catch (err) {
      logger.error('Failed to set tags in Sentry', err as Error);
    }
  }

  /**
   * Set extra context
   */
  setExtra(key: string, value: any): void {
    if (!this.isEnabled()) return;

    try {
      Sentry.setExtra(key, value);
    } catch (err) {
      logger.error('Failed to set extra in Sentry', err as Error);
    }
  }

  /**
   * Set request context from Express request
   */
  setRequestContext(req: Request): void {
    if (!this.isEnabled()) return;

    try {
      Sentry.setContext('request', {
        method: req.method,
        url: req.originalUrl,
        headers: this.sanitizeHeaders(req.headers),
        query: req.query,
        ip: req.ip,
        user_agent: req.get('user-agent'),
      });
    } catch (err) {
      logger.error('Failed to set request context in Sentry', err as Error);
    }
  }

  /**
   * Start a transaction for performance monitoring
   */
  startTransaction(name: string, op: string): string | undefined {
    if (!this.isEnabled()) return undefined;

    try {
      // For newer Sentry SDK versions, we would use startSpan
      // However, since transaction tracking might not be available,
      // we return a unique ID for tracking purposes
      const transactionId = `sentry_${Date.now()}_${crypto.randomUUID().substring(0, 8)}`;
      
      // Add breadcrumb to track transaction
      this.addBreadcrumb({
        message: `Transaction started: ${name}`,
        category: 'transaction',
        data: { op, transaction_id: transactionId },
      });
      
      return transactionId;
    } catch (err) {
      logger.error('Failed to start transaction in Sentry', err as Error);
      return undefined;
    }
  }

  /**
   * Sanitize headers to remove sensitive data
   */
  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    const sensitiveKeys = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];

    for (const key of sensitiveKeys) {
      if (sanitized[key]) {
        sanitized[key] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  /**
   * Flush pending events (useful for graceful shutdown)
   */
  async flush(timeout: number = 2000): Promise<boolean> {
    if (!this.isEnabled()) return true;

    try {
      return await Sentry.flush(timeout);
    } catch (err) {
      logger.error('Failed to flush Sentry events', err as Error);
      return false;
    }
  }

  /**
   * Close Sentry client
   */
  async close(timeout: number = 2000): Promise<boolean> {
    if (!this.isEnabled()) return true;

    try {
      return await Sentry.close(timeout);
    } catch (err) {
      logger.error('Failed to close Sentry client', err as Error);
      return false;
    }
  }
}

/**
 * Export singleton instance
 */
export const sentryService = new SentryService();

/**
 * Export Sentry for direct access if needed
 */
export { Sentry };

/**
 * Export default
 */
export default sentryService;
