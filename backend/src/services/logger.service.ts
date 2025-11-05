/**
 * Logger Service
 * Centralized logging service using Winston with file and console transports
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { getConfig } from '../config';

// Get configuration
const config = getConfig();
const loggingConfig = config.getLoggingConfig();
const isProduction = config.isProduction();
const isDevelopment = config.isDevelopment();

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

  constructor(context?: string) {
    this.logger = context ? logger.child({ context }) : logger;
  }

  /**
   * Log error message
   */
  error(message: string, trace?: string, context?: string): void {
    const meta: any = {};
    if (trace) meta.trace = trace;
    if (context) meta.context = context;
    this.logger.error(message, meta);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: string): void {
    const meta: any = {};
    if (context) meta.context = context;
    this.logger.warn(message, meta);
  }

  /**
   * Log info message
   */
  info(message: string, context?: string): void {
    const meta: any = {};
    if (context) meta.context = context;
    this.logger.info(message, meta);
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: string): void {
    const meta: any = {};
    if (context) meta.context = context;
    this.logger.debug(message, meta);
  }

  /**
   * Log verbose message
   */
  verbose(message: string, context?: string): void {
    const meta: any = {};
    if (context) meta.context = context;
    this.logger.verbose(message, meta);
  }

  /**
   * Log with custom level
   */
  log(level: string, message: string, meta?: any): void {
    this.logger.log(level, message, meta);
  }
}

/**
 * Export default logger instance
 */
export default logger;
