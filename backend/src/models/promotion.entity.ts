import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type PromotionType = 'percentage' | 'fixed' | 'bogo' | 'free_shipping';

@Entity('promo_codes')
@Index(['code'], { unique: true })
export class Promotion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  @Index()
  code: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 20, name: 'discount_type' })
  discountType: string;

  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2,
    name: 'discount_value',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value)
    }
  })
  discountValue: number;

  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2, 
    nullable: true,
    name: 'min_order_value',
    transformer: {
      to: (value: number | undefined) => value,
      from: (value: string | null) => value ? parseFloat(value) : null
    }
  })
  minOrderValue?: number;

  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2, 
    nullable: true,
    name: 'max_discount_amount',
    transformer: {
      to: (value: number | undefined) => value,
      from: (value: string | null) => value ? parseFloat(value) : null
    }
  })
  maxDiscountAmount?: number;

  @Column({ type: 'timestamp', name: 'valid_from' })
  validFrom: Date;

  @Column({ type: 'timestamp', name: 'valid_until' })
  validUntil: Date;

  @Column({ type: 'integer', nullable: true, name: 'usage_limit' })
  usageLimit?: number;

  @Column({ type: 'integer', default: 0, name: 'usage_count' })
  usageCount: number;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'json', nullable: true, name: 'applicable_categories' })
  applicableCategories?: number[];

  @Column({ type: 'json', nullable: true, name: 'applicable_products' })
  applicableProducts?: number[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
