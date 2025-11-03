import jwt from 'jsonwebtoken';
import { authConfig, JWTPayload } from '../../config/auth.config';

export class TokenService {
  private static blacklistedTokens = new Set<string>();

  /**
   * Generate access token
   */
  static generateAccessToken(payload: JWTPayload): string {
    const { userId, email, role } = payload;
    return jwt.sign(
      { userId, email, role },
      authConfig.jwt.secret,
      { expiresIn: authConfig.jwt.expiresIn } as jwt.SignOptions
    ) as string;
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: JWTPayload): string {
    const { userId, email, role } = payload;
    return jwt.sign(
      { userId, email, role },
      authConfig.jwt.refreshSecret,
      { expiresIn: authConfig.jwt.refreshExpiresIn } as jwt.SignOptions
    ) as string;
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): JWTPayload | null {
    try {
      if (this.isBlacklisted(token)) {
        return null;
      }
      const decoded = jwt.verify(token, authConfig.jwt.secret as string) as JWTPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): JWTPayload | null {
    try {
      if (this.isBlacklisted(token)) {
        return null;
      }
      const decoded = jwt.verify(token, authConfig.jwt.refreshSecret as string) as JWTPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Blacklist a token (for logout)
   */
  static blacklistToken(token: string): void {
    this.blacklistedTokens.add(token);
  }

  /**
   * Check if token is blacklisted
   */
  static isBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }

  /**
   * Clear blacklist (useful for testing)
   */
  static clearBlacklist(): void {
    this.blacklistedTokens.clear();
  }

  /**
   * Generate both access and refresh tokens
   */
  static generateTokenPair(payload: JWTPayload): { accessToken: string; refreshToken: string } {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  /**
   * Decode token without verification (for inspection)
   */
  static decodeToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.decode(token) as JWTPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }
}
