import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { authConfig, UserRole } from '../../config/auth.config';
import { TokenService } from './token.service';

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  isEmailVerified: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  emailVerificationToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterUserDTO {
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  // In-memory user storage (replace with database in production)
  private static users: Map<string, User> = new Map();
  private static usersByEmail: Map<string, User> = new Map();

  /**
   * Hash password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, authConfig.bcrypt.rounds);
  }

  /**
   * Compare password with hash
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Register a new user
   */
  static async register(dto: RegisterUserDTO): Promise<AuthResponse> {
    const { email, password, role = UserRole.CUSTOMER } = dto;

    // Check if user already exists
    if (this.usersByEmail.has(email.toLowerCase())) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create user
    const user: User = {
      id: this.generateId(),
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      isEmailVerified: false,
      emailVerificationToken: this.generateToken(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store user
    this.users.set(user.id, user);
    this.usersByEmail.set(user.email, user);

    // Generate tokens
    const { accessToken, refreshToken } = TokenService.generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login user
   */
  static async login(dto: LoginDTO): Promise<AuthResponse> {
    const { email, password } = dto;

    // Find user
    const user = this.usersByEmail.get(email.toLowerCase());
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await this.comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const { accessToken, refreshToken } = TokenService.generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Verify refresh token
    const payload = TokenService.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new Error('Invalid refresh token');
    }

    // Generate new tokens
    const tokens = TokenService.generateTokenPair({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    // Blacklist old refresh token
    TokenService.blacklistToken(refreshToken);

    return tokens;
  }

  /**
   * Logout user
   */
  static logout(accessToken: string, refreshToken: string): void {
    // Blacklist both tokens
    TokenService.blacklistToken(accessToken);
    TokenService.blacklistToken(refreshToken);
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(email: string): Promise<{ message: string; resetToken?: string }> {
    const user = this.usersByEmail.get(email.toLowerCase());
    if (!user) {
      // Don't reveal if user exists
      return { message: 'If user exists, password reset email will be sent' };
    }

    // Generate reset token
    const resetToken = this.generateToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    user.updatedAt = new Date();

    return {
      message: 'Password reset email sent',
      resetToken, // In production, send via email
    };
  }

  /**
   * Reset password
   */
  static async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    // Find user with valid reset token
    const user = Array.from(this.users.values()).find(
      (u) => u.resetPasswordToken === token && u.resetPasswordExpires && u.resetPasswordExpires > new Date()
    );

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    // Hash new password
    user.password = await this.hashPassword(newPassword);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.updatedAt = new Date();

    return { message: 'Password reset successful' };
  }

  /**
   * Verify email
   */
  static verifyEmail(token: string): { message: string } {
    // Find user with verification token
    const user = Array.from(this.users.values()).find((u) => u.emailVerificationToken === token);

    if (!user) {
      throw new Error('Invalid verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.updatedAt = new Date();

    return { message: 'Email verified successfully' };
  }

  /**
   * Get user by ID
   */
  static getUserById(id: string): Omit<User, 'password'> | null {
    const user = this.users.get(id);
    if (!user) {
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Get user by email
   */
  static getUserByEmail(email: string): Omit<User, 'password'> | null {
    const user = this.usersByEmail.get(email.toLowerCase());
    if (!user) {
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Helper: Generate unique ID
   */
  private static generateId(): string {
    return `user_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
  }

  /**
   * Helper: Generate random token
   */
  private static generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Clear all users (for testing)
   */
  static clearUsers(): void {
    this.users.clear();
    this.usersByEmail.clear();
  }
}
