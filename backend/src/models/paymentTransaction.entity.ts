import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Order } from './order.entity';

@Entity('payment_transactions')
export class PaymentTransaction {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'order_id', type: 'int' })
  orderId!: number;

  @Column({ name: 'user_id', type: 'int' })
  userId!: number;

  @Column({ type: 'varchar', length: 50 })
  provider!: string; // pesepay, paynow, stripe

  @Column({ name: 'provider_transaction_id', type: 'varchar', length: 255, nullable: true })
  providerTransactionId?: string;

  @Column({ name: 'poll_url', type: 'varchar', length: 500, nullable: true })
  pollUrl?: string;

  @Column({ name: 'redirect_url', type: 'varchar', length: 500, nullable: true })
  redirectUrl?: string;

  @Column({ name: 'payment_method', type: 'varchar', length: 50 })
  paymentMethod!: string; // ecocash, visa, onemoney

  @Column({ name: 'payment_method_code', type: 'varchar', length: 20, nullable: true })
  paymentMethodCode?: string; // PZW201 for EcoCash

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  amount!: number;

  @Column({ type: 'varchar', length: 10, default: 'ZWL' })
  currency!: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status!: string; // pending, processing, paid, failed, cancelled, refunded

  @Column({ name: 'customer_phone', type: 'varchar', length: 50, nullable: true })
  customerPhone?: string;

  @Column({ name: 'customer_email', type: 'varchar', length: 255, nullable: true })
  customerEmail?: string;

  @Column({ name: 'transaction_reference', type: 'varchar', length: 255 })
  transactionReference!: string;

  @Column({ name: 'payment_description', type: 'text', nullable: true })
  paymentDescription?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order!: Order;
}
