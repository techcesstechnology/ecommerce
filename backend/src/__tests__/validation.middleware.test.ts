import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
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

  describe('validate', () => {
    it('should call next if validation passes', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'TestPassword123!',
      };

      const validations = [body('email').isEmail(), body('password').isLength({ min: 8 })];

      const middleware = validate(validations);

      await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 400 if validation fails', async () => {
      mockRequest.body = {
        email: 'invalid-email',
        password: 'short',
      };

      const validations = [
        body('email').isEmail().withMessage('Invalid email'),
        body('password').isLength({ min: 8 }).withMessage('Password too short'),
      ];

      const middleware = validate(validations);

      await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation Error',
          message: 'Invalid input data',
          details: expect.any(Array),
        })
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return detailed error messages', async () => {
      mockRequest.body = {
        email: 'invalid-email',
      };

      const validations = [
        body('email').isEmail().withMessage('Please provide a valid email address'),
      ];

      const middleware = validate(validations);

      await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'email',
              message: 'Please provide a valid email address',
            }),
          ]),
        })
      );
    });
  });
});
