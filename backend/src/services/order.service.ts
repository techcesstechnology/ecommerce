import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database.config';
import { Order, OrderItem, ShippingAddress } from '../models/order.entity';

export interface CreateOrderDto {
  userId: string;
  items: OrderItem[];
  subtotal: number;
  tax?: number;
  shippingCost?: number;
  total: number;
  paymentMethod: string;
  shippingAddress: ShippingAddress;
  notes?: string;
}

export interface UpdateOrderDto {
  status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  notes?: string;
}

export interface OrderFilters {
  userId?: string;
  status?: string;
  paymentStatus?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export class OrderService {
  private orderRepository: Repository<Order>;

  constructor() {
    this.orderRepository = AppDataSource.getRepository(Order);
  }

  /**
   * Generate a unique order number
   */
  private async generateOrderNumber(): Promise<string> {
    const prefix = 'ORD';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Create a new order
   */
  async createOrder(data: CreateOrderDto): Promise<Order> {
    try {
      const orderNumber = await this.generateOrderNumber();
      const order = this.orderRepository.create({
        ...data,
        orderNumber,
        tax: data.tax || 0,
        shippingCost: data.shippingCost || 0,
      });
      return await this.orderRepository.save(order);
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(id: string): Promise<Order | null> {
    try {
      return await this.orderRepository.findOne({
        where: { id },
        relations: ['user'],
      });
    } catch (error) {
      console.error('Error fetching order:', error);
      throw new Error('Failed to fetch order');
    }
  }

  /**
   * Get order by order number
   */
  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    try {
      return await this.orderRepository.findOne({
        where: { orderNumber },
        relations: ['user'],
      });
    } catch (error) {
      console.error('Error fetching order by number:', error);
      throw new Error('Failed to fetch order by number');
    }
  }

  /**
   * Get orders with filters and pagination
   */
  async getOrders(filters: OrderFilters): Promise<{ orders: Order[]; total: number }> {
    try {
      const query = this.orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.user', 'user');

      if (filters.userId) {
        query.andWhere('order.userId = :userId', { userId: filters.userId });
      }

      if (filters.status) {
        query.andWhere('order.status = :status', { status: filters.status });
      }

      if (filters.paymentStatus) {
        query.andWhere('order.paymentStatus = :paymentStatus', {
          paymentStatus: filters.paymentStatus,
        });
      }

      if (filters.startDate && filters.endDate) {
        query.andWhere('order.createdAt BETWEEN :startDate AND :endDate', {
          startDate: filters.startDate,
          endDate: filters.endDate,
        });
      } else if (filters.startDate) {
        query.andWhere('order.createdAt >= :startDate', { startDate: filters.startDate });
      } else if (filters.endDate) {
        query.andWhere('order.createdAt <= :endDate', { endDate: filters.endDate });
      }

      // Pagination
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;

      query.skip(skip).take(limit);

      // Sorting
      const sortBy = filters.sortBy || 'createdAt';
      const sortOrder = filters.sortOrder || 'DESC';
      query.orderBy(`order.${sortBy}`, sortOrder);

      const [orders, total] = await query.getManyAndCount();

      return { orders, total };
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new Error('Failed to fetch orders');
    }
  }

  /**
   * Update an order
   */
  async updateOrder(id: string, data: UpdateOrderDto): Promise<Order | null> {
    try {
      const order = await this.orderRepository.findOne({ where: { id } });
      if (!order) {
        return null;
      }

      Object.assign(order, data);
      return await this.orderRepository.save(order);
    } catch (error) {
      console.error('Error updating order:', error);
      throw new Error('Failed to update order');
    }
  }

  /**
   * Get user's orders
   */
  async getUserOrders(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ orders: Order[]; total: number }> {
    try {
      const skip = (page - 1) * limit;

      const [orders, total] = await this.orderRepository.findAndCount({
        where: { userId },
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
      });

      return { orders, total };
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw new Error('Failed to fetch user orders');
    }
  }

  /**
   * Get order statistics
   */
  async getOrderStats(
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    statusBreakdown: Record<string, number>;
  }> {
    try {
      const query = this.orderRepository.createQueryBuilder('order');

      if (startDate && endDate) {
        query.where('order.createdAt BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        });
      }

      const orders = await query.getMany();

      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      const statusBreakdown = orders.reduce(
        (acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      return {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        statusBreakdown,
      };
    } catch (error) {
      console.error('Error fetching order statistics:', error);
      throw new Error('Failed to fetch order statistics');
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(id: string): Promise<Order | null> {
    try {
      const order = await this.orderRepository.findOne({ where: { id } });
      if (!order) {
        return null;
      }

      // Only allow cancellation if order is in pending or confirmed status
      if (order.status !== 'pending' && order.status !== 'confirmed') {
        throw new Error('Order cannot be cancelled at this stage');
      }

      order.status = 'cancelled';
      return await this.orderRepository.save(order);
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }
}

export const orderService = new OrderService();
