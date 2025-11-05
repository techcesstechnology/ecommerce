import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database.config';
import { User } from '../models/user.entity';

export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
  phone?: string;
  role?: 'customer' | 'admin' | 'vendor';
}

export interface UpdateUserDto {
  name?: string;
  phone?: string;
  password?: string;
  isActive?: boolean;
  lastLoginAt?: Date;
}

export class UserService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   * Create a new user
   */
  async createUser(data: CreateUserDto): Promise<User> {
    try {
      const user = this.userRepository.create({
        ...data,
        role: data.role || 'customer',
      });
      return await this.userRepository.save(user);
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({ where: { id } });
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch user');
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({ where: { email } });
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw new Error('Failed to fetch user by email');
    }
  }

  /**
   * Get all users with filters
   */
  async getUsers(filters?: {
    role?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ users: User[]; total: number }> {
    try {
      const query = this.userRepository.createQueryBuilder('user');

      if (filters?.role) {
        query.andWhere('user.role = :role', { role: filters.role });
      }

      if (filters?.isActive !== undefined) {
        query.andWhere('user.isActive = :isActive', { isActive: filters.isActive });
      }

      // Pagination
      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const skip = (page - 1) * limit;

      query.skip(skip).take(limit);
      query.orderBy('user.createdAt', 'DESC');

      const [users, total] = await query.getManyAndCount();

      return { users, total };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  /**
   * Update a user
   */
  async updateUser(id: string, data: UpdateUserDto): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        return null;
      }

      Object.assign(user, data);
      return await this.userRepository.save(user);
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  /**
   * Delete a user (soft delete by setting isActive to false)
   */
  async deleteUser(id: string): Promise<boolean> {
    try {
      const result = await this.userRepository.update(id, { isActive: false });
      return result.affected !== undefined && result.affected > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  /**
   * Update user's last login time
   */
  async updateLastLogin(id: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        return null;
      }

      user.lastLoginAt = new Date();
      return await this.userRepository.save(user);
    } catch (error) {
      console.error('Error updating last login:', error);
      throw new Error('Failed to update last login');
    }
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    try {
      const count = await this.userRepository.count({ where: { email } });
      return count > 0;
    } catch (error) {
      console.error('Error checking email existence:', error);
      throw new Error('Failed to check email existence');
    }
  }
}

export const userService = new UserService();
