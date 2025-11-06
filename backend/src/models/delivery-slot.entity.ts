import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('delivery_slots')
@Index(['date', 'startTime'])
export class DeliverySlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  @Index()
  date: Date;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ type: 'integer' })
  maxOrders: number;

  @Column({ type: 'integer', default: 0 })
  currentOrders: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  deliveryFee?: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
