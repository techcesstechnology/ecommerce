import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
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

export class UserController {
  /**
   * Get user by ID (admin only)
   */
  static getUserById(req: Request, res: Response): void {
    try {
      const { id } = req.params;

      const user = AuthService.getUserById(id);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      logger.info('User retrieved', {
        requestedBy: req.user?.userId,
        userId: id,
      });

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      logger.error('Get user error', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to get user',
      });
    }
  }

  /**
   * Get user by email (admin only)
   */
  static getUserByEmail(req: Request, res: Response): void {
    try {
      const { email } = req.params;

      const user = AuthService.getUserByEmail(email);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      logger.info('User retrieved by email', {
        requestedBy: req.user?.userId,
        email,
      });

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      logger.error('Get user by email error', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to get user',
      });
    }
  }
}
