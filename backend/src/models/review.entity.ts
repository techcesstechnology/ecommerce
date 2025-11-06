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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'integer' })
  rating: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  title?: string;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @Column({ type: 'boolean', default: false })
  verifiedPurchase: boolean;

  @Column({ type: 'boolean', default: true })
  isApproved: boolean;

  @Column({ type: 'integer', default: 0 })
  helpfulCount: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
