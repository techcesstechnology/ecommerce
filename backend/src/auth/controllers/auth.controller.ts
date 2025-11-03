import { Request, Response } from 'express';
import { AuthService, RegisterUserDTO, LoginDTO } from '../services/auth.service';
import {
  validate,
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../validators/auth.validator';
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

export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      // Validate request
      const dto = validate<RegisterUserDTO>(registerSchema, req.body);

      // Register user
      const result = await AuthService.register(dto);

      logger.info('User registered successfully', {
        userId: result.user.id,
        email: result.user.email,
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Registration error', { error });
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed',
      });
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate request
      const dto = validate<LoginDTO>(loginSchema, req.body);

      // Login user
      const result = await AuthService.login(dto);

      logger.info('User logged in successfully', {
        userId: result.user.id,
        email: result.user.email,
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      logger.error('Login error', { error });
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : 'Login failed',
      });
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      // Validate request
      const { refreshToken } = validate<{ refreshToken: string }>(
        refreshTokenSchema,
        req.body
      );

      // Refresh tokens
      const tokens = await AuthService.refreshToken(refreshToken);

      logger.info('Token refreshed successfully');

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: tokens,
      });
    } catch (error) {
      logger.error('Token refresh error', { error });
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : 'Token refresh failed',
      });
    }
  }

  /**
   * Logout user
   */
  static logout(req: Request, res: Response): void {
    try {
      const authHeader = req.headers.authorization;
      const refreshToken = req.body.refreshToken;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(400).json({
          success: false,
          message: 'No token provided',
        });
        return;
      }

      const accessToken = authHeader.substring(7);

      // Logout user
      AuthService.logout(accessToken, refreshToken);

      logger.info('User logged out successfully', {
        userId: req.user?.userId,
      });

      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      logger.error('Logout error', { error });
      res.status(500).json({
        success: false,
        message: 'Logout failed',
      });
    }
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      // Validate request
      const { email } = validate<{ email: string }>(
        requestPasswordResetSchema,
        req.body
      );

      // Request password reset
      const result = await AuthService.requestPasswordReset(email);

      logger.info('Password reset requested', { email });

      res.status(200).json({
        success: true,
        message: result.message,
        // In development, return token (remove in production)
        ...(process.env.NODE_ENV === 'development' && { resetToken: result.resetToken }),
      });
    } catch (error) {
      logger.error('Password reset request error', { error });
      res.status(500).json({
        success: false,
        message: 'Password reset request failed',
      });
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      // Validate request
      const { token, password } = validate<{ token: string; password: string }>(
        resetPasswordSchema,
        req.body
      );

      // Reset password
      const result = await AuthService.resetPassword(token, password);

      logger.info('Password reset successfully');

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      logger.error('Password reset error', { error });
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Password reset failed',
      });
    }
  }

  /**
   * Verify email
   */
  static verifyEmail(req: Request, res: Response): void {
    try {
      // Validate request
      const { token } = validate<{ token: string }>(
        verifyEmailSchema,
        req.body
      );

      // Verify email
      const result = AuthService.verifyEmail(token);

      logger.info('Email verified successfully');

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      logger.error('Email verification error', { error });
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Email verification failed',
      });
    }
  }

  /**
   * Get current user profile
   */
  static getProfile(req: Request, res: Response): void {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Not authenticated',
        });
        return;
      }

      const user = AuthService.getUserById(req.user.userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      logger.error('Get profile error', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to get profile',
      });
    }
  }
}
