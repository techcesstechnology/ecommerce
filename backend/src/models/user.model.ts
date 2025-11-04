/**
 * User Model
 *
 * Represents the User entity in the database
 * Currently uses in-memory storage - to be replaced with actual database (PostgreSQL) implementation
 *
 * Note: This is a placeholder implementation. In production, this should be replaced
 * with a proper ORM model (e.g., Prisma, TypeORM, or Sequelize)
 */

import { UserRole } from '@freshroute/shared';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const SALT_ROUNDS = 10;

/**
 * User entity interface
 */
export interface User {
  id: string;
  email: string;
  password: string; // Hashed password
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  refreshToken?: string; // Stored hashed refresh token
  createdAt: Date;
  updatedAt: Date;
}

/**
 * In-memory user storage
 * TODO: Replace with actual database implementation
 */
class UserModel {
  private users: Map<string, User> = new Map();

  /**
   * Create a new user
   * @param userData User registration data
   * @returns Created user
   */
  async create(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: UserRole;
  }): Promise<User> {
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);

    const user: User = {
      id: uuidv4(),
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      role: userData.role || UserRole.CUSTOMER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(user.id, user);
    return user;
  }

  /**
   * Find a user by ID
   * @param id User ID
   * @returns User or undefined
   */
  async findById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  /**
   * Find a user by email
   * @param email User email
   * @returns User or undefined
   */
  async findByEmail(email: string): Promise<User | undefined> {
    const normalizedEmail = email.toLowerCase();
    return Array.from(this.users.values()).find((user) => user.email === normalizedEmail);
  }

  /**
   * Update a user
   * @param id User ID
   * @param updates Partial user data to update
   * @returns Updated user or undefined
   */
  async update(
    id: string,
    updates: Partial<Omit<User, 'id' | 'createdAt'>>
  ): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    // If password is being updated, hash it
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, SALT_ROUNDS);
    }

    const updatedUser: User = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  /**
   * Delete a user
   * @param id User ID
   * @returns True if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  /**
   * Compare a plain text password with a hashed password
   * @param plainPassword Plain text password
   * @param hashedPassword Hashed password
   * @returns True if passwords match
   */
  async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Get all users (for admin purposes)
   * @returns Array of all users
   */
  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  /**
   * Store hashed refresh token for a user
   * @param userId User ID
   * @param refreshToken Refresh token to hash and store
   */
  async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const user = this.users.get(userId);
    if (!user) return;

    const hashedToken = await bcrypt.hash(refreshToken, SALT_ROUNDS);
    user.refreshToken = hashedToken;
    user.updatedAt = new Date();
    this.users.set(userId, user);
  }

  /**
   * Verify a refresh token for a user
   * @param userId User ID
   * @param refreshToken Refresh token to verify
   * @returns True if token is valid
   */
  async verifyRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user || !user.refreshToken) return false;

    return bcrypt.compare(refreshToken, user.refreshToken);
  }

  /**
   * Clear refresh token for a user (logout)
   * @param userId User ID
   */
  async clearRefreshToken(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (!user) return;

    user.refreshToken = undefined;
    user.updatedAt = new Date();
    this.users.set(userId, user);
  }
}

// Export a singleton instance
export const userModel = new UserModel();
