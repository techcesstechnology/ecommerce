/**
 * Authentication Controller
 *
 * HTTP request handlers for authentication endpoints
 * Validates input, calls auth service, and formats responses
 */

import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/auth.validator';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ZodError } from 'zod';

/**
 * Register a new user
 * POST /api/auth/register
 *
 * @param req Request with registration data in body
 * @param res Response with user data and tokens
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input
    const validatedData = registerSchema.parse(req.body);

    // Register user
    const result = await authService.register(validatedData);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (error instanceof Error) {
      // Check for duplicate email error
      if (error.message.includes('already exists')) {
        res.status(409).json({
          success: false,
          message: error.message,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 *
 * @param req Request with login credentials in body
 * @param res Response with user data and tokens
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input
    const validatedData = loginSchema.parse(req.body);

    // Login user
    const result = await authService.login(validatedData);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (error instanceof Error) {
      // Generic error for invalid credentials (don't reveal which field is wrong)
      if (error.message.includes('Invalid email or password')) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 *
 * @param req Request with refresh token in body
 * @param res Response with new tokens
 */
export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input
    const validatedData = refreshTokenSchema.parse(req.body);

    // Refresh tokens
    const tokens = await authService.refreshToken(validatedData.refreshToken);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: tokens,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (error instanceof Error) {
      res.status(401).json({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 * Requires authentication
 *
 * @param req Authenticated request
 * @param res Response confirming logout
 */
export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Logout user (clear refresh token)
    await authService.logout(req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Logout successful',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 * Requires authentication
 *
 * @param req Authenticated request
 * @param res Response with user profile data
 */
export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Get user profile
    const user = await authService.getUserById(req.user.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: user,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
};
