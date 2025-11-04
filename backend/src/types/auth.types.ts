/**
 * Authentication Types
 *
 * Defines TypeScript interfaces and types for authentication-related operations
 * including user registration, login, tokens, and JWT payloads.
 */

import { UserRole } from '@freshroute/shared';

/**
 * User registration data transfer object
 * Contains all required fields for creating a new user account
 */
export interface RegisterDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole;
}

/**
 * User login credentials
 */
export interface LoginDTO {
  email: string;
  password: string;
}

/**
 * JWT token payload structure
 * Contains user identification and role information
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number; // Issued at timestamp
  exp?: number; // Expiration timestamp
}

/**
 * Authentication tokens response
 * Includes both access token and refresh token
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

/**
 * Authentication response with user data and tokens
 */
export interface AuthResponse {
  user: UserResponse;
  tokens: AuthTokens;
}

/**
 * User response object (excludes sensitive data like password)
 */
export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Refresh token request payload
 */
export interface RefreshTokenDTO {
  refreshToken: string;
}

/**
 * Password reset request
 */
export interface PasswordResetRequestDTO {
  email: string;
}

/**
 * Password reset confirmation
 */
export interface PasswordResetDTO {
  token: string;
  newPassword: string;
}

/**
 * Extended Express Request with authenticated user
 */
export interface AuthRequest extends Express.Request {
  user?: JWTPayload;
}
