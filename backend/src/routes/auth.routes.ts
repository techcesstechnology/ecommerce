/**
 * Authentication Routes
 *
 * Defines authentication-related API endpoints
 * Maps HTTP routes to controller functions with rate limiting
 */

import { Router } from 'express';
import { register, login, refresh, logout, getProfile } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import {
  loginRateLimiter,
  registrationRateLimiter,
  generalRateLimiter,
} from '../middleware/rate-limit.middleware';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * @rateLimit 3 requests per hour
 */
router.post('/register', registrationRateLimiter, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get tokens
 * @access  Public
 * @rateLimit 5 requests per 15 minutes
 */
router.post('/login', loginRateLimiter, login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 * @rateLimit General rate limit (100 requests per 15 minutes)
 */
router.post('/refresh', generalRateLimiter, refresh);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and invalidate refresh token
 * @access  Private (requires authentication)
 * @rateLimit General rate limit (100 requests per 15 minutes)
 */
router.post('/logout', generalRateLimiter, authenticate, logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private (requires authentication)
 * @rateLimit General rate limit (100 requests per 15 minutes)
 */
router.get('/me', generalRateLimiter, authenticate, getProfile);

export default router;
