import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import speakeasy from 'speakeasy';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database.config';
import { User } from '../models/user.entity';

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

export interface RegisterDto {
  email: string;
  name: string;
  password: string;
  phone?: string;
  role?: 'customer' | 'admin' | 'vendor';
}

export interface LoginDto {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   * Hash password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Compare password with hash
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT access token
   */
  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'freshroute-api',
      audience: 'freshroute-client',
    } as SignOptions);
  }

  /**
   * Generate JWT refresh token
   */
  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: 'freshroute-api',
      audience: 'freshroute-client',
    } as SignOptions);
  }

  /**
   * Verify JWT access token
   */
  verifyAccessToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET, {
        issuer: 'freshroute-api',
        audience: 'freshroute-client',
      }) as TokenPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify JWT refresh token
   */
  verifyRefreshToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET, {
        issuer: 'freshroute-api',
        audience: 'freshroute-client',
      }) as TokenPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate email verification token
   */
  generateEmailVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate password reset token
   */
  generatePasswordResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Register a new user
   */
  async register(data: RegisterDto): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: { email: data.email.toLowerCase() },
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Validate password strength
      this.validatePasswordStrength(data.password);

      // Hash password
      const hashedPassword = await this.hashPassword(data.password);

      // Generate email verification token
      const emailVerificationToken = this.generateEmailVerificationToken();
      const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create user
      const user = this.userRepository.create({
        email: data.email.toLowerCase(),
        name: data.name,
        password: hashedPassword,
        phone: data.phone,
        role: data.role || 'customer',
        emailVerificationToken,
        emailVerificationExpires,
        emailVerified: false,
      });

      const savedUser = await this.userRepository.save(user);

      // TODO: Send email verification email
      console.log(`Email verification token for ${savedUser.email}: ${emailVerificationToken}`);

      return savedUser;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(data: LoginDto, ipAddress?: string): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      // Find user by email
      const user = await this.userRepository.findOne({
        where: { email: data.email.toLowerCase() },
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if account is locked
      if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
        const remainingTime = Math.ceil((user.accountLockedUntil.getTime() - Date.now()) / 60000);
        throw new Error(`Account is locked. Try again in ${remainingTime} minutes`);
      }

      // Check if account is active
      if (!user.isActive) {
        throw new Error('Account is deactivated. Please contact support');
      }

      // Verify password
      const isPasswordValid = await this.comparePassword(data.password, user.password);

      if (!isPasswordValid) {
        // Increment failed login attempts
        user.failedLoginAttempts += 1;

        // Lock account if max attempts reached
        if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
          user.accountLockedUntil = new Date(Date.now() + LOCK_TIME);
          await this.userRepository.save(user);
          throw new Error(
            'Account locked due to too many failed login attempts. Try again in 15 minutes'
          );
        }

        await this.userRepository.save(user);
        throw new Error('Invalid email or password');
      }

      // Check 2FA if enabled
      if (user.twoFactorEnabled && user.twoFactorSecret) {
        if (!data.twoFactorCode) {
          throw new Error('Two-factor authentication code required');
        }

        const isValid = speakeasy.totp.verify({
          secret: user.twoFactorSecret,
          encoding: 'base32',
          token: data.twoFactorCode,
          window: 2,
        });

        if (!isValid) {
          user.failedLoginAttempts += 1;
          await this.userRepository.save(user);
          throw new Error('Invalid two-factor authentication code');
        }
      }

      // Reset failed login attempts
      user.failedLoginAttempts = 0;
      user.accountLockedUntil = undefined;
      user.lastLoginAt = new Date();
      user.lastLoginIp = ipAddress || undefined;

      // Generate tokens
      const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = this.generateAccessToken(tokenPayload);
      const refreshToken = this.generateRefreshToken(tokenPayload);

      // Store refresh token hash
      user.refreshTokenHash = await this.hashPassword(refreshToken);
      await this.userRepository.save(user);

      return {
        user,
        tokens: {
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      console.error('Error logging in user:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const payload = this.verifyRefreshToken(refreshToken);

      if (!payload) {
        throw new Error('Invalid or expired refresh token');
      }

      // Find user
      const user = await this.userRepository.findOne({
        where: { id: payload.userId },
      });

      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      // Verify refresh token matches stored hash
      if (!user.refreshTokenHash) {
        throw new Error('No refresh token found');
      }

      const isValid = await this.comparePassword(refreshToken, user.refreshTokenHash);

      if (!isValid) {
        throw new Error('Invalid refresh token');
      }

      // Generate new tokens
      const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const newAccessToken = this.generateAccessToken(tokenPayload);
      const newRefreshToken = this.generateRefreshToken(tokenPayload);

      // Update refresh token hash
      user.refreshTokenHash = await this.hashPassword(newRefreshToken);
      await this.userRepository.save(user);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }

  /**
   * Logout user (invalidate refresh token)
   */
  async logout(userId: string): Promise<void> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (user) {
        user.refreshTokenHash = undefined;
        await this.userRepository.save(user);
      }
    } catch (error) {
      console.error('Error logging out user:', error);
      throw error;
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { emailVerificationToken: token },
      });

      if (!user) {
        throw new Error('Invalid or expired verification token');
      }

      if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
        throw new Error('Verification token has expired');
      }

      user.emailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;

      return await this.userRepository.save(user);
    } catch (error) {
      console.error('Error verifying email:', error);
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<string> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        // Don't reveal if user exists
        return 'If an account with that email exists, a password reset link has been sent';
      }

      // Generate reset token
      const resetToken = this.generatePasswordResetToken();
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      user.passwordResetToken = resetToken;
      user.passwordResetExpires = resetExpires;

      await this.userRepository.save(user);

      // TODO: Send password reset email
      console.log(`Password reset token for ${user.email}: ${resetToken}`);

      return 'If an account with that email exists, a password reset link has been sent';
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const user = await this.userRepository.findOne({
        where: { passwordResetToken: token },
      });

      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
        throw new Error('Reset token has expired');
      }

      // Validate password strength
      this.validatePasswordStrength(newPassword);

      // Hash new password
      user.password = await this.hashPassword(newPassword);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.refreshTokenHash = undefined; // Invalidate refresh tokens
      user.failedLoginAttempts = 0;
      user.accountLockedUntil = undefined;

      await this.userRepository.save(user);
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  /**
   * Setup two-factor authentication
   */
  async setupTwoFactor(userId: string): Promise<{ secret: string; qrCode: string }> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Generate 2FA secret
      const secret = speakeasy.generateSecret({
        name: `FreshRoute (${user.email})`,
        issuer: 'FreshRoute',
        length: 32,
      });

      // Store secret (not enabled yet)
      user.twoFactorSecret = secret.base32;
      await this.userRepository.save(user);

      return {
        secret: secret.base32,
        qrCode: secret.otpauth_url || '',
      };
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      throw error;
    }
  }

  /**
   * Enable two-factor authentication
   */
  async enableTwoFactor(userId: string, token: string): Promise<void> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user || !user.twoFactorSecret) {
        throw new Error('Two-factor setup not initiated');
      }

      // Verify token
      const isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token,
        window: 2,
      });

      if (!isValid) {
        throw new Error('Invalid verification code');
      }

      user.twoFactorEnabled = true;
      await this.userRepository.save(user);
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      throw error;
    }
  }

  /**
   * Disable two-factor authentication
   */
  async disableTwoFactor(userId: string, password: string): Promise<void> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Verify password
      const isPasswordValid = await this.comparePassword(password, user.password);

      if (!isPasswordValid) {
        throw new Error('Invalid password');
      }

      user.twoFactorEnabled = false;
      user.twoFactorSecret = undefined;
      await this.userRepository.save(user);
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      throw error;
    }
  }

  /**
   * Validate password strength
   */
  private validatePasswordStrength(password: string): void {
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      throw new Error('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      throw new Error('Password must contain at least one special character');
    }
  }

  /**
   * Get user by ID (exclude sensitive fields)
   */
  async getUserById(
    userId: string
  ): Promise<Omit<User, 'password' | 'twoFactorSecret' | 'refreshTokenHash'> | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        return null;
      }

      // Remove sensitive fields
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, twoFactorSecret, refreshTokenHash, ...userWithoutSensitive } = user;

      return userWithoutSensitive;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
