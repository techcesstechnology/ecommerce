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
import { Wishlist } from './wishlist.entity';
import { Product } from './product.entity';

@Entity('wishlist_items')
@Index(['wishlistId', 'productId'], { unique: true })
export class WishlistItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', name: 'wishlist_id' })
  @Index()
  wishlistId: number;

  @ManyToOne(() => Wishlist, (wishlist) => wishlist.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wishlist_id' })
  wishlist: Wishlist;

  @Column({ type: 'integer', name: 'product_id' })
  @Index()
  productId: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
