/**
 * Error Handler Middleware Tests
 */

import { Request, Response, NextFunction } from 'express';
import { errorHandler, notFoundHandler, asyncHandler } from '../middleware/error-handler.middleware';
import { BadRequestError, InternalServerError } from '../utils/errors';
import { logger } from '../services/logger.service';

// Mock logger
jest.mock('../services/logger.service', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

describe('Error Handler Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      originalUrl: '/api/test',
      ip: '127.0.0.1',
      get: jest.fn((header: string): string | undefined => {
        if (header === 'user-agent') return 'test-agent';
        return undefined;
      }) as any,
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();

    // Clear mock calls
    jest.clearAllMocks();
  });

  describe('errorHandler', () => {
    it('should handle AppError correctly', () => {
      const error = new BadRequestError('Invalid input', 'INVALID_INPUT');
      
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Error',
          message: 'Invalid input',
          statusCode: 400,
          code: 'INVALID_INPUT',
        })
      );
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should handle generic Error', () => {
      const error = new Error('Something went wrong');
      
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
        })
      );
      expect(logger.error).toHaveBeenCalled();
    });

    it('should log errors with proper severity', () => {
      // Test 4xx error (warn level)
      const clientError = new BadRequestError('Client error');
      errorHandler(clientError, mockReq as Request, mockRes as Response, mockNext);
      expect(logger.warn).toHaveBeenCalled();

      jest.clearAllMocks();

      // Test 5xx error (error level)
      const serverError = new InternalServerError('Server error');
      errorHandler(serverError, mockReq as Request, mockRes as Response, mockNext);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('notFoundHandler', () => {
    it('should return 404 response', () => {
      notFoundHandler(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Not Found',
          statusCode: 404,
          path: '/api/test',
        })
      );
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('asyncHandler', () => {
    it('should handle successful async function', async () => {
      const asyncFn = jest.fn().mockResolvedValue(undefined);
      const wrappedFn = asyncHandler(asyncFn);

      await wrappedFn(mockReq as Request, mockRes as Response, mockNext);

      expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should catch and forward errors to next', async () => {
      const error = new Error('Async error');
      const asyncFn = jest.fn().mockRejectedValue(error);
      const wrappedFn = asyncHandler(asyncFn);

      await wrappedFn(mockReq as Request, mockRes as Response, mockNext);

      expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
