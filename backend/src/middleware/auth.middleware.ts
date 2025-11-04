/**
 * Authentication Middleware
 *
 * Middleware for protecting routes and verifying JWT tokens
 * Attaches authenticated user information to request object
 */

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../config/jwt.config';
import { JWTPayload } from '../types/auth.types';
import { UserRole } from '@freshroute/shared';

/**
 * Extended Request interface with user property
 */
export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header
 * Attaches decoded user information to request object
 *
 * @example
 * router.get('/protected', authenticate, controller);
 */
export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: 'No authorization token provided',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Check if token is in Bearer format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({
        success: false,
        message: 'Invalid authorization format. Use: Bearer <token>',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const token = parts[1];

    // Verify token
    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid token';
      res.status(401).json({
        success: false,
        message: errorMessage,
        timestamp: new Date().toISOString(),
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authentication error',
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Authorization middleware factory
 * Checks if authenticated user has one of the required roles
 *
 * @param roles Array of allowed user roles
 * @returns Middleware function
 *
 * @example
 * router.delete('/users/:id', authenticate, authorize([UserRole.ADMIN]), controller);
 */
export const authorize = (roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
};

/**
 * Optional authentication middleware
 * Attaches user to request if valid token is provided, but doesn't reject if missing
 * Useful for routes that have different behavior for authenticated vs unauthenticated users
 *
 * @example
 * router.get('/products', optionalAuthenticate, controller);
 */
export const optionalAuthenticate = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      next();
      return;
    }

    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      const token = parts[1];
      try {
        const decoded = verifyAccessToken(token);
        req.user = decoded;
      } catch {
        // Token is invalid but we don't reject the request
      }
    }

    next();
  } catch {
    next();
  }
};
