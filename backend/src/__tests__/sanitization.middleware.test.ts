import { Request, Response, NextFunction } from 'express';
import { sanitizeInput, preventNoSQLInjection } from '../middleware/sanitization.middleware';

describe('Sanitization Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
      query: {},
      params: {},
    };
    mockResponse = {};
    nextFunction = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sanitizeInput', () => {
    it('should remove script tags from body', () => {
      mockRequest.body = {
        name: 'Test<script>alert("XSS")</script>User',
      };

      sanitizeInput(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.body.name).toBe('TestUser');
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should remove event handlers from strings', () => {
      mockRequest.body = {
        description: 'Click <a href="#" onclick="alert()">here</a>',
      };

      sanitizeInput(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.body.description).not.toContain('onclick=');
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should remove javascript: protocol', () => {
      mockRequest.body = {
        url: 'javascript:alert("XSS")',
      };

      sanitizeInput(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.body.url).not.toContain('javascript:');
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should sanitize nested objects', () => {
      mockRequest.body = {
        user: {
          name: 'Test<script>alert()</script>',
          profile: {
            bio: '<script>malicious()</script>bio',
          },
        },
      };

      sanitizeInput(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.body.user.name).toBe('Test');
      expect(mockRequest.body.user.profile.bio).toBe('bio');
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should sanitize arrays', () => {
      mockRequest.body = {
        items: ['<script>test</script>', 'normal string', '<script>another</script>'],
      };

      sanitizeInput(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.body.items[0]).toBe('');
      expect(mockRequest.body.items[1]).toBe('normal string');
      expect(mockRequest.body.items[2]).toBe('');
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should not modify safe strings', () => {
      mockRequest.body = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      sanitizeInput(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.body.name).toBe('John Doe');
      expect(mockRequest.body.email).toBe('john@example.com');
      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('preventNoSQLInjection', () => {
    it('should remove MongoDB operators from body', () => {
      mockRequest.body = {
        username: 'user',
        password: { $ne: null },
      };

      preventNoSQLInjection(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.body.password).toEqual({});
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should remove $where operator', () => {
      mockRequest.body = {
        filter: {
          $where: 'this.password == "test"',
        },
      };

      preventNoSQLInjection(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.body.filter).toEqual({});
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should remove nested MongoDB operators', () => {
      mockRequest.body = {
        user: {
          credentials: {
            password: { $gt: '' },
          },
        },
      };

      preventNoSQLInjection(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.body.user.credentials.password).toEqual({});
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should preserve safe fields', () => {
      mockRequest.body = {
        username: 'testuser',
        email: 'test@example.com',
        age: 25,
      };

      preventNoSQLInjection(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.body.username).toBe('testuser');
      expect(mockRequest.body.email).toBe('test@example.com');
      expect(mockRequest.body.age).toBe(25);
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should handle arrays correctly', () => {
      mockRequest.body = {
        items: [
          { name: 'item1', price: 100 },
          { name: 'item2', $gte: 50 },
        ],
      };

      preventNoSQLInjection(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.body.items[0]).toEqual({ name: 'item1', price: 100 });
      expect(mockRequest.body.items[1]).toEqual({ name: 'item2' });
      expect(nextFunction).toHaveBeenCalled();
    });
  });
});
