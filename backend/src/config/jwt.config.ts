/**
 * JWT Configuration
 *
 * Configuration and utility functions for JWT token management
 * Handles access token and refresh token generation and verification
 */

import jwt, { SignOptions } from 'jsonwebtoken';
import { JWTPayload, AuthTokens } from '../types/auth.types';
import { config } from './index';

/**
 * JWT configuration constants
 */
export const jwtConfig = {
  accessTokenSecret: config.jwt.secret,
  refreshTokenSecret: config.jwt.secret + '_refresh', // Different secret for refresh tokens
  accessTokenExpiresIn: config.jwt.expiresIn, // e.g., '7d' or '15m'
  refreshTokenExpiresIn: '30d', // Refresh tokens last longer
};

/**
 * Generate access token
 * @param payload JWT payload containing user information
 * @returns Signed JWT access token
 */
export const generateAccessToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  const options: SignOptions = {
    expiresIn: jwtConfig.accessTokenExpiresIn as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, jwtConfig.accessTokenSecret, options);
};

/**
 * Generate refresh token
 * @param payload JWT payload containing user information
 * @returns Signed JWT refresh token
 */
export const generateRefreshToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  const options: SignOptions = {
    expiresIn: jwtConfig.refreshTokenExpiresIn as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, jwtConfig.refreshTokenSecret, options);
};

/**
 * Generate both access and refresh tokens
 * @param payload JWT payload containing user information
 * @returns Object containing both tokens and expiration info
 */
export const generateAuthTokens = (payload: Omit<JWTPayload, 'iat' | 'exp'>): AuthTokens => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
    expiresIn: jwtConfig.accessTokenExpiresIn,
  };
};

/**
 * Verify access token
 * @param token JWT access token to verify
 * @returns Decoded JWT payload if valid
 * @throws Error if token is invalid or expired
 */
export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, jwtConfig.accessTokenSecret) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    throw error;
  }
};

/**
 * Verify refresh token
 * @param token JWT refresh token to verify
 * @returns Decoded JWT payload if valid
 * @throws Error if token is invalid or expired
 */
export const verifyRefreshToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, jwtConfig.refreshTokenSecret) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token expired');
    }
    throw error;
  }
};

/**
 * Decode token without verification (for debugging purposes)
 * @param token JWT token to decode
 * @returns Decoded token payload or null
 */
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
};
