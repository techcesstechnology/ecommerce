import { Router } from 'express';
import { body, param } from 'express-validator';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  loginLimiter,
  registerLimiter,
  passwordResetLimiter,
} from '../middleware/rate-limit.middleware';
import { sanitizeInput } from '../middleware/sanitization.middleware';

const router = Router();

// Apply sanitization to all routes
router.use(sanitizeInput);

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  registerLimiter,
  validate([
    body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter')
      .matches(/[a-z]/)
      .withMessage('Password must contain at least one lowercase letter')
      .matches(/[0-9]/)
      .withMessage('Password must contain at least one number')
      .matches(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/)
      .withMessage('Password must contain at least one special character'),
    body('phone')
      .optional()
      .matches(/^\+?[1-9]\d{1,14}$/)
      .withMessage('Please provide a valid phone number'),
    body('role')
      .optional()
      .isIn(['customer', 'admin', 'vendor'])
      .withMessage('Role must be customer, admin, or vendor'),
  ]),
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  loginLimiter,
  validate([
    body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    body('twoFactorCode')
      .optional()
      .isLength({ min: 6, max: 6 })
      .withMessage('Two-factor code must be 6 digits'),
  ]),
  authController.login
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', authController.refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   GET /api/auth/verify-email/:token
 * @desc    Verify user email
 * @access  Public
 */
router.get(
  '/verify-email/:token',
  validate([
    param('token').isLength({ min: 32, max: 64 }).withMessage('Invalid verification token'),
  ]),
  authController.verifyEmail
);

/**
 * @route   POST /api/auth/password-reset/request
 * @desc    Request password reset
 * @access  Public
 */
router.post(
  '/password-reset/request',
  passwordResetLimiter,
  validate([
    body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  ]),
  authController.requestPasswordReset
);

/**
 * @route   POST /api/auth/password-reset/:token
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
  '/password-reset/:token',
  validate([
    param('token').isLength({ min: 32, max: 64 }).withMessage('Invalid reset token'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter')
      .matches(/[a-z]/)
      .withMessage('Password must contain at least one lowercase letter')
      .matches(/[0-9]/)
      .withMessage('Password must contain at least one number')
      .matches(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/)
      .withMessage('Password must contain at least one special character'),
  ]),
  authController.resetPassword
);

/**
 * @route   POST /api/auth/2fa/setup
 * @desc    Setup two-factor authentication
 * @access  Private
 */
router.post('/2fa/setup', authenticate, authController.setupTwoFactor);

/**
 * @route   POST /api/auth/2fa/enable
 * @desc    Enable two-factor authentication
 * @access  Private
 */
router.post(
  '/2fa/enable',
  authenticate,
  validate([body('token').isLength({ min: 6, max: 6 }).withMessage('Token must be 6 digits')]),
  authController.enableTwoFactor
);

/**
 * @route   POST /api/auth/2fa/disable
 * @desc    Disable two-factor authentication
 * @access  Private
 */
router.post(
  '/2fa/disable',
  authenticate,
  validate([body('password').notEmpty().withMessage('Password is required')]),
  authController.disableTwoFactor
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, authController.getCurrentUser);

export default router;
