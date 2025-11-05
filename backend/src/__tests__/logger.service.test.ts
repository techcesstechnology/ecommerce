/**
 * Logger Service Tests
 */

import { LoggerService } from '../services/logger.service';

// Mock the config service
jest.mock('../config', () => ({
  getConfig: jest.fn(() => ({
    getLoggingConfig: jest.fn(() => ({
      level: 'debug',
      format: 'json',
      directory: './logs',
      maxFiles: 14,
      maxSize: '20m',
    })),
    isProduction: jest.fn(() => false),
    isDevelopment: jest.fn(() => true),
  })),
}));

describe('Logger Service', () => {
  describe('LoggerService class', () => {
    let loggerService: LoggerService;

    beforeEach(() => {
      loggerService = new LoggerService('TestContext');
    });

    it('should create logger instance', () => {
      expect(loggerService).toBeDefined();
    });

    it('should have error logging method', () => {
      expect(typeof loggerService.error).toBe('function');
      // Test that calling it doesn't throw
      expect(() => loggerService.error('Test error')).not.toThrow();
    });

    it('should have warn logging method', () => {
      expect(typeof loggerService.warn).toBe('function');
      expect(() => loggerService.warn('Test warning')).not.toThrow();
    });

    it('should have info logging method', () => {
      expect(typeof loggerService.info).toBe('function');
      expect(() => loggerService.info('Test info')).not.toThrow();
    });

    it('should have debug logging method', () => {
      expect(typeof loggerService.debug).toBe('function');
      expect(() => loggerService.debug('Test debug')).not.toThrow();
    });

    it('should have verbose logging method', () => {
      expect(typeof loggerService.verbose).toBe('function');
      expect(() => loggerService.verbose('Test verbose')).not.toThrow();
    });

    it('should have custom log method', () => {
      expect(typeof loggerService.log).toBe('function');
      expect(() => loggerService.log('info', 'Test message')).not.toThrow();
    });
  });
});
