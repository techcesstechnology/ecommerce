/**
 * Authentication Service
 *
 * Business logic layer for authentication operations
 * Handles user registration, login, token refresh, and logout
 * Uses TypeORM for PostgreSQL database operations
 */

import { User } from '../models/user.model';
import { RegisterDTO, LoginDTO, AuthResponse, UserResponse, AuthTokens } from '../types/auth.types';
import { generateAuthTokens, verifyRefreshToken } from '../config/jwt.config';
import { AppDataSource } from '../config/database.config';
import { Repository } from 'typeorm';

/**
 * Get User repository
 * @returns TypeORM Repository for User entity
 */
const getUserRepository = (): Repository<User> => {
  return AppDataSource.getRepository(User);
};

/**
 * Convert User model to UserResponse (exclude sensitive fields)
 * @param user User model
 * @returns User response object
 */
const toUserResponse = (user: User): UserResponse => {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

/**
 * Authentication Service Class
 */
class AuthService {
  /**
   * Register a new user
   * @param registerData User registration data
   * @returns Authentication response with user and tokens
   * @throws Error if email already exists
   */
  async register(registerData: RegisterDTO): Promise<AuthResponse> {
    const userRepository = getUserRepository();

    // Check if user already exists
    const existingUser = await userRepository.findOne({
      where: { email: registerData.email.toLowerCase() },
    });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const user = userRepository.create({
      email: registerData.email.toLowerCase(),
      password: registerData.password, // Will be hashed by @BeforeInsert hook
      firstName: registerData.firstName,
      lastName: registerData.lastName,
      phone: registerData.phone,
      role: registerData.role,
    });

    await userRepository.save(user);

    // Generate tokens
    const tokens = generateAuthTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Store refresh token hash
    await user.setRefreshToken(tokens.refreshToken);
    await userRepository.save(user);

    return {
      user: toUserResponse(user),
      tokens,
    };
  }

  /**
   * Login user with email and password
   * @param loginData User login credentials
   * @returns Authentication response with user and tokens
   * @throws Error if credentials are invalid
   */
  async login(loginData: LoginDTO): Promise<AuthResponse> {
    const userRepository = getUserRepository();

    // Find user by email
    const user = await userRepository.findOne({
      where: { email: loginData.email.toLowerCase() },
    });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(loginData.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const tokens = generateAuthTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Store refresh token hash
    await user.setRefreshToken(tokens.refreshToken);
    await userRepository.save(user);

    return {
      user: toUserResponse(user),
      tokens,
    };
  }

  /**
   * Refresh access token using refresh token
   * @param refreshToken Refresh token
   * @returns New authentication tokens
   * @throws Error if refresh token is invalid or expired
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const userRepository = getUserRepository();

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }

    // Find user
    const user = await userRepository.findOne({ where: { id: decoded.userId } });
    if (!user) {
      throw new Error('User not found');
    }

    // Verify stored refresh token
    const isRefreshTokenValid = await user.verifyRefreshToken(refreshToken);
    if (!isRefreshTokenValid) {
      throw new Error('Invalid refresh token');
    }

    // Generate new tokens
    const tokens = generateAuthTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Store new refresh token hash
    await user.setRefreshToken(tokens.refreshToken);
    await userRepository.save(user);

    return tokens;
  }

  /**
   * Logout user (invalidate refresh token)
   * @param userId User ID
   */
  async logout(userId: string): Promise<void> {
    const userRepository = getUserRepository();
    const user = await userRepository.findOne({ where: { id: userId } });
    if (user) {
      user.clearRefreshToken();
      await userRepository.save(user);
    }
  }

  /**
   * Get user by ID
   * @param userId User ID
   * @returns User response or undefined
   */
  async getUserById(userId: string): Promise<UserResponse | undefined> {
    const userRepository = getUserRepository();
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) return undefined;
    return toUserResponse(user);
  }

  /**
   * Get user by email
   * @param email User email
   * @returns User response or undefined
   */
  async getUserByEmail(email: string): Promise<UserResponse | undefined> {
    const userRepository = getUserRepository();
    const user = await userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
    if (!user) return undefined;
    return toUserResponse(user);
  }
}

// Export singleton instance
export const authService = new AuthService();
