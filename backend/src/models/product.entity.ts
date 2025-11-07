import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Category } from './category.entity';

@Entity('products')
@Index(['sku'], { unique: true })
@Index(['name'])
@Index(['categoryId'])
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  sku: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value)
    }
  })
  price: number;

  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2, 
    nullable: true, 
    name: 'sale_price',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => value ? parseFloat(value) : null
    }
  })
  salePrice?: number;

  @Column({ type: 'integer', default: 0, name: 'stock_quantity' })
  stockQuantity: number;

  @Column({ type: 'integer', default: 10, name: 'low_stock_threshold' })
  lowStockThreshold: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  unit?: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'image_url' })
  imageUrl?: string;

  @Column({ type: 'json', nullable: true })
  images?: string[];

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_featured' })
  isFeatured: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subcategory?: string;

  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2, 
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => value ? parseFloat(value) : null
    }
  })
  weight?: number;

  @Column({ type: 'json', nullable: true })
  dimensions?: { length?: number; width?: number; height?: number };

  @Column({ type: 'json', nullable: true, name: 'nutritional_info' })
  nutritionalInfo?: any;

  @Column({ type: 'json', nullable: true })
  tags?: string[];

  @Column({ type: 'json', nullable: true })
  specifications?: any;

  @Column({ type: 'integer', name: 'category_id' })
  @Index()
  categoryId: number;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ 
    type: 'decimal', 
    precision: 3, 
    scale: 2, 
    default: 0, 
    name: 'average_rating',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value)
    }
  })
  averageRating: number;

  @Column({ type: 'integer', default: 0, name: 'review_count' })
  reviewCount: number;

  @Column({ type: 'integer', default: 0, name: 'view_count' })
  viewCount: number;

  @Column({ type: 'integer', default: 0, name: 'sales_count' })
  salesCount: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
