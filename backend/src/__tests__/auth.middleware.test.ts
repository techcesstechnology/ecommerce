import { Response, NextFunction } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.middleware';
import { authService } from '../services/auth.service';

// Mock authService
jest.mock('../services/auth.service', () => ({
  authService: {
    verifyAccessToken: jest.fn(),
    getUserById: jest.fn(),
  },
}));

describe('Authentication Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      user: undefined,
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should return 401 if no authorization header', async () => {
      await authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'No token provided',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if authorization header does not start with Bearer', async () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat token',
      };

      await authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'No token provided',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      (authService.verifyAccessToken as jest.Mock).mockReturnValue(null);

      await authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should attach user to request and call next if token is valid', async () => {
      const mockPayload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'customer',
      };

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      (authService.verifyAccessToken as jest.Mock).mockReturnValue(mockPayload);

      await authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockRequest.user).toEqual(mockPayload);
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    it('should return 401 if user is not authenticated', () => {
      const authorizeMiddleware = authorize('admin');

      authorizeMiddleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 403 if user does not have required role', () => {
      mockRequest.user = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'customer',
      };

      const authorizeMiddleware = authorize('admin');

      authorizeMiddleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Forbidden',
        message: 'Insufficient permissions',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next if user has required role', () => {
      mockRequest.user = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'admin',
      };

      const authorizeMiddleware = authorize('admin');

      authorizeMiddleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should call next if user has one of multiple required roles', () => {
      mockRequest.user = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'vendor',
      };

      const authorizeMiddleware = authorize('admin', 'vendor');

      authorizeMiddleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });
});
