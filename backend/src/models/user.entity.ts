import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('users')
@Index(['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  email: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 50, default: 'customer' })
  role: 'customer' | 'admin' | 'vendor';

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'last_login', type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  // Email verification fields
  @Column({ name: 'is_email_verified', type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ name: 'email_verification_token', type: 'varchar', length: 255, nullable: true })
  emailVerificationToken?: string;

  @Column({ name: 'email_verification_expires', type: 'timestamp', nullable: true })
  emailVerificationExpires?: Date;

  // Password reset fields
  @Column({ name: 'password_reset_token', type: 'varchar', length: 255, nullable: true })
  passwordResetToken?: string;

  @Column({ name: 'password_reset_expires', type: 'timestamp', nullable: true })
  passwordResetExpires?: Date;

  // Two-factor authentication fields
  @Column({ name: 'two_factor_enabled', type: 'boolean', default: false })
  twoFactorEnabled: boolean;

  @Column({ name: 'two_factor_secret', type: 'varchar', length: 255, nullable: true })
  twoFactorSecret?: string;

  // Refresh token (stored hash)
  @Column({ name: 'refresh_token', type: 'varchar', length: 500, nullable: true })
  refreshTokenHash?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
