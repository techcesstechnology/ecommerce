import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/token.service';
import { JWTPayload } from '../../config/auth.config';
import winston from 'winston';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Extend Express Request type to include user
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'No token provided',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = TokenService.verifyAccessToken(token);
    if (!payload) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
      return;
    }

    // Attach user to request
    req.user = payload;

    logger.info('User authenticated', {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    next();
  } catch (error) {
    logger.error('Authentication error', { error });
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user to request if token is present, but doesn't require it
 */
export const optionalAuthenticate = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);
    const payload = TokenService.verifyAccessToken(token);
    
    if (payload) {
      req.user = payload;
      logger.info('User optionally authenticated', {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      });
    }

    next();
  } catch (error) {
    logger.error('Optional authentication error', { error });
    next();
  }
};
