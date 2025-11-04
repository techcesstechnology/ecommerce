import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { formatError } from '../utils';

// Extended Request interface to include user information
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Middleware to check if user is an admin
 * Note: This is a simplified version. In production, implement proper JWT authentication
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const authReq = req as AuthenticatedRequest;

  // TODO: Implement proper JWT authentication
  // For now, check for admin header (this is just for development)
  const adminHeader = req.headers['x-admin-role'];

  if (adminHeader === 'admin') {
    // Simulate authenticated admin user
    authReq.user = {
      id: 'admin-user-id',
      email: 'admin@freshroute.com',
      role: 'ADMIN',
    };
    next();
  } else {
    res.status(403).json(formatError('Access denied. Admin privileges required.', 'ADMIN_ONLY'));
  }
};

/**
 * Middleware to validate request body for errors from express-validator
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json(formatError('Validation failed', errors.array()));
    return;
  }

  next();
};
