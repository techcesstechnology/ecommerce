import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Product } from './product.entity';

@Entity('reviews')
@Index(['productId'])
@Index(['userId'])
@Index(['rating'])
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', name: 'product_id' })
  @Index()
  productId: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'integer', name: 'user_id' })
  @Index()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'integer', name: 'order_id', nullable: true })
  orderId?: number;

  @Column({ type: 'integer' })
  rating: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title?: string;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @Column({ type: 'boolean', name: 'is_verified_purchase', default: false })
  verifiedPurchase: boolean;

  @Column({ type: 'boolean', name: 'is_approved', default: true })
  isApproved: boolean;

  @Column({ type: 'integer', name: 'helpful_count', default: 0 })
  helpfulCount: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
