import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type PromotionType = 'percentage' | 'fixed' | 'bogo' | 'free_shipping';

@Entity('promotions')
@Index(['code'], { unique: true })
@Index(['startDate', 'endDate'])
export class Promotion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @Index()
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 50 })
  type: PromotionType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minPurchaseAmount?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxDiscountAmount?: number;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ type: 'integer', nullable: true })
  usageLimit?: number;

  @Column({ type: 'integer', default: 0 })
  usageCount: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'simple-array', nullable: true })
  applicableCategories?: string[];

  @Column({ type: 'simple-array', nullable: true })
  applicableProducts?: string[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
