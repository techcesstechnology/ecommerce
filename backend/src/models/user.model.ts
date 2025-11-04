/**
 * User Model
 *
 * Represents the User entity in the database using TypeORM
 * PostgreSQL-backed implementation with proper ORM support
 */

import { UserRole } from '@freshroute/shared';
import bcrypt from 'bcrypt';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

const SALT_ROUNDS = 10;

/**
 * User entity with TypeORM decorators
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string; // Hashed password

  @Column({ type: 'varchar', length: 100, name: 'first_name' })
  firstName: string;

  @Column({ type: 'varchar', length: 100, name: 'last_name' })
  lastName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @Column({ type: 'text', nullable: true, name: 'refresh_token' })
  refreshToken?: string; // Stored hashed refresh token

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  /**
   * Hash password before insert
   */
  @BeforeInsert()
  async hashPasswordBeforeInsert() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
    }
  }

  /**
   * Hash password before update if it was changed
   * Note: This will only hash if password was explicitly changed.
   * TypeORM does not call BeforeUpdate hooks if the entity was not modified.
   */
  @BeforeUpdate()
  async hashPasswordBeforeUpdate() {
    // Skip if password is already hashed (bcrypt hashes are 60 characters)
    if (this.password && this.password.length !== 60) {
      this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
    }
  }

  /**
   * Compare a plain text password with the hashed password
   * @param plainPassword Plain text password
   * @returns Promise that resolves to true if passwords match
   */
  async comparePassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.password);
  }

  /**
   * Hash and store refresh token
   * @param refreshToken Refresh token to hash and store
   */
  async setRefreshToken(refreshToken: string): Promise<void> {
    this.refreshToken = await bcrypt.hash(refreshToken, SALT_ROUNDS);
  }

  /**
   * Verify a refresh token
   * @param refreshToken Refresh token to verify
   * @returns Promise that resolves to true if token is valid
   */
  async verifyRefreshToken(refreshToken: string): Promise<boolean> {
    if (!this.refreshToken) return false;
    return bcrypt.compare(refreshToken, this.refreshToken);
  }

  /**
   * Clear refresh token (logout)
   */
  clearRefreshToken(): void {
    this.refreshToken = undefined;
  }
}
