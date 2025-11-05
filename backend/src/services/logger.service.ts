/**
 * Logger Service
 * Centralized logging service using Winston with file and console transports
 * Enhanced with correlation IDs, structured metadata, and rate limiting
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { getConfig } from '../config';
import { Request } from 'express';
import crypto from 'crypto';

// Get configuration
const config = getConfig();
const loggingConfig = config.getLoggingConfig();
const isProduction = config.isProduction();
const isDevelopment = config.isDevelopment();

/**
 * Logger options interface
 */
export interface LoggerOptions {
  level?: string;
  correlation_id?: string;
  metadata?: Record<string, any>;
  user_id?: string;
  request_id?: string;
  ip?: string;
  method?: string;
  url?: string;
  user_agent?: string;
  status_code?: number;
  response_time?: number;
}

/**
 * Rate limiting cache for logging
 */
const logRateLimitCache = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration - can be overridden via config
const getLogRateLimitConfig = () => {
  const envWindow = parseInt(process.env.LOG_RATE_LIMIT_WINDOW_MS || '60000', 10);
  const envMax = parseInt(process.env.LOG_RATE_LIMIT_MAX || '100', 10);
  
  return {
    window: isNaN(envWindow) ? 60000 : envWindow,
    max: isNaN(envMax) ? 100 : envMax,
  };
};

/**
 * Check if log should be rate limited
 */
function shouldRateLimit(key: string): boolean {
  const config = getLogRateLimitConfig();
  const now = Date.now();
  const entry = logRateLimitCache.get(key);

  if (!entry || entry.resetTime < now) {
    logRateLimitCache.set(key, { count: 1, resetTime: now + config.window });
    return false;
  }

  if (entry.count >= config.max) {
    return true;
  }

  entry.count++;
  return false;
}

/**
 * Generate correlation ID
 */
export function generateCorrelationId(): string {
  return crypto.randomUUID();
}

/**
 * Extract correlation ID from request
 */
export function getCorrelationId(req: Request): string {
  // Check various possible correlation ID headers
  const correlationId =
    req.headers['x-correlation-id'] || req.headers['x-request-id'] || req.headers['x-trace-id'];

  if (correlationId && typeof correlationId === 'string') {
    return correlationId;
  }

  // Generate new correlation ID
  return generateCorrelationId();
}

/**
 * Custom log format for production
 */
const productionFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Custom log format for development
 */
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  })
);

/**
 * Create daily rotate file transport
 */
const createRotateFileTransport = (level: string, filename: string): DailyRotateFile => {
  return new DailyRotateFile({
    level,
    dirname: path.join(process.cwd(), loggingConfig.directory),
    filename: `${filename}-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    maxSize: loggingConfig.maxSize,
    maxFiles: loggingConfig.maxFiles,
    format: productionFormat,
  });
};

/**
 * Create Winston logger instance
 */
const createLogger = (): winston.Logger => {
  const transports: winston.transport[] = [];

  // Console transport for development
  if (isDevelopment) {
    transports.push(
      new winston.transports.Console({
        level: loggingConfig.level,
        format: developmentFormat,
      })
    );
  }

  // Console transport for production (errors only)
  if (isProduction) {
    transports.push(
      new winston.transports.Console({
        level: 'error',
        format: productionFormat,
      })
    );
  }

  // File transports (production and development)
  if (isProduction || isDevelopment) {
    // Error logs
    transports.push(createRotateFileTransport('error', 'error'));

    // Combined logs (all levels)
    transports.push(createRotateFileTransport(loggingConfig.level, 'combined'));

    // HTTP logs (for Morgan)
    transports.push(createRotateFileTransport('info', 'http'));
  }

  return winston.createLogger({
    level: loggingConfig.level,
    format: isProduction ? productionFormat : developmentFormat,
    transports,
    exitOnError: false,
  });
};

/**
 * Logger instance
 */
export const logger = createLogger();

/**
 * Stream for Morgan HTTP logging
 */
export const morganStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

/**
 * Logger Service class with utility methods
 */
export class LoggerService {
  private logger: winston.Logger;
  private context?: string;
  private correlationId?: string;

  constructor(context?: string, correlationId?: string) {
    this.context = context;
    this.correlationId = correlationId;
    this.logger = context ? logger.child({ context }) : logger;
  }

  /**
   * Set correlation ID for this logger instance
   */
  setCorrelationId(correlationId: string): void {
    this.correlationId = correlationId;
  }

  /**
   * Get correlation ID
   */
  getCorrelationId(): string | undefined {
    return this.correlationId;
  }

  /**
   * Build metadata object with correlation ID
   */
  private buildMetadata(options?: LoggerOptions): any {
    const meta: any = {
      ...options?.metadata,
    };

    // Add correlation ID
    if (this.correlationId || options?.correlation_id) {
      meta.correlation_id = this.correlationId || options?.correlation_id;
    }

    // Add request ID
    if (options?.request_id) {
      meta.request_id = options.request_id;
    }

    // Add user ID
    if (options?.user_id) {
      meta.user_id = options.user_id;
    }

    // Add request context
    if (options?.ip) meta.ip = options.ip;
    if (options?.method) meta.method = options.method;
    if (options?.url) meta.url = options.url;

    // Add context if available
    if (this.context && !meta.context) {
      meta.context = this.context;
    }

    return meta;
  }

  /**
   * Log error message
   */
  error(message: string, trace?: string | Error, options?: LoggerOptions): void {
    const rateLimitKey = `error:${message.substring(0, 50)}`;
    if (shouldRateLimit(rateLimitKey)) {
      return;
    }

    const meta = this.buildMetadata(options);

    if (trace) {
      if (trace instanceof Error) {
        meta.trace = trace.stack;
        meta.error_name = trace.name;
      } else {
        meta.trace = trace;
      }
    }

    this.logger.error(message, meta);
  }

  /**
   * Log warning message
   */
  warn(message: string, options?: LoggerOptions): void {
    const meta = this.buildMetadata(options);
    this.logger.warn(message, meta);
  }

  /**
   * Log info message
   */
  info(message: string, options?: LoggerOptions): void {
    const meta = this.buildMetadata(options);
    this.logger.info(message, meta);
  }

  /**
   * Log debug message
   */
  debug(message: string, options?: LoggerOptions): void {
    const meta = this.buildMetadata(options);
    this.logger.debug(message, meta);
  }

  /**
   * Log verbose message
   */
  verbose(message: string, options?: LoggerOptions): void {
    const meta = this.buildMetadata(options);
    this.logger.verbose(message, meta);
  }

  /**
   * Log with custom level
   */
  log(level: string, message: string, options?: LoggerOptions): void {
    const meta = this.buildMetadata(options);
    this.logger.log(level, message, meta);
  }

  /**
   * Log HTTP request
   */
  logRequest(req: Request, responseTime?: number): void {
    const correlationId = getCorrelationId(req);
    this.info('HTTP Request', {
      correlation_id: correlationId,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      user_agent: req.get('user-agent'),
      response_time: responseTime,
      metadata: {
        query: Object.keys(req.query).length > 0 ? req.query : undefined,
        params: Object.keys(req.params).length > 0 ? req.params : undefined,
      },
    });
  }

  /**
   * Log HTTP response
   */
  logResponse(req: Request, statusCode: number, responseTime: number): void {
    const correlationId = getCorrelationId(req);
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

    this.log(level, 'HTTP Response', {
      correlation_id: correlationId,
      method: req.method,
      url: req.originalUrl,
      status_code: statusCode,
      response_time: responseTime,
      ip: req.ip,
    });
  }
}

/**
 * Export default logger instance
 */
export default logger;
