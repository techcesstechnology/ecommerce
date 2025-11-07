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
import { User } from './user.entity';

export interface OrderItem {
  productId: number;
  productName: string;
  sku: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode?: string;
}

@Entity('orders')
@Index(['orderNumber'], { unique: true })
@Index(['userId'])
@Index(['status'])
@Index(['createdAt'])
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true, name: 'order_number' })
  @Index()
  orderNumber: string;

  @Column({ type: 'integer', name: 'user_id' })
  @Index()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'jsonb' })
  items: OrderItem[];

  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value)
    }
  })
  subtotal: number;

  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2, 
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value)
    }
  })
  tax: number;

  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2, 
    default: 0,
    name: 'shipping_cost',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value)
    }
  })
  shippingCost: number;

  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value)
    }
  })
  total: number;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  @Index()
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

  @Column({ type: 'varchar', length: 50, default: 'pending', name: 'payment_status' })
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';

  @Column({ type: 'varchar', length: 100, name: 'payment_method' })
  paymentMethod: string;

  @Column({ type: 'jsonb', name: 'shipping_address' })
  shippingAddress: ShippingAddress;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'integer', nullable: true, name: 'delivery_slot_id' })
  deliverySlotId?: number;

  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2, 
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value)
    }
  })
  discount: number;

  @Column({ type: 'integer', nullable: true, name: 'promo_code_id' })
  promoCodeId?: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  @Index()
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
