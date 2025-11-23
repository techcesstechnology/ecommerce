import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database.config';
import { Order, OrderItem, ShippingAddress } from '../models/order.entity';
import { Product } from '../models/product.entity';
import { Cart } from '../models/cart.entity';
import { CartService } from './cart.service';
import { AppError } from '../utils/errors';

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
  userId?: number;
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
  private productRepository: Repository<Product>;
  private cartRepository: Repository<Cart>;
  private cartService: CartService;

  constructor() {
    this.orderRepository = AppDataSource.getRepository(Order);
    this.productRepository = AppDataSource.getRepository(Product);
    this.cartRepository = AppDataSource.getRepository(Cart);
    this.cartService = new CartService();
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
      const userIdNum = Number(data.userId);
      if (!Number.isInteger(userIdNum) || userIdNum <= 0) {
        throw new AppError('Invalid user ID', 400);
      }

      const orderNumber = await this.generateOrderNumber();
      const order = this.orderRepository.create({
        ...data,
        userId: userIdNum,
        orderNumber,
        tax: data.tax || 0,
        shippingCost: data.shippingCost || 0,
      });
      return await this.orderRepository.save(order);
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(id: string): Promise<Order | null> {
    try {
      const idNum = Number(id);
      if (!Number.isInteger(idNum) || idNum <= 0) {
        throw new AppError('Invalid order ID', 400);
      }

      return await this.orderRepository.findOne({
        where: { id: idNum },
        relations: ['user'],
      });
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
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
      if (filters.userId !== undefined) {
        const userIdNum = Number(filters.userId);
        if (!Number.isInteger(userIdNum) || userIdNum <= 0) {
          throw new AppError('Invalid user ID filter', 400);
        }
        filters.userId = userIdNum;
      }

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
      throw error;
    }
  }

  /**
   * Update an order
   */
  async updateOrder(id: string, data: UpdateOrderDto): Promise<Order | null> {
    try {
      const idNum = Number(id);
      if (!Number.isInteger(idNum) || idNum <= 0) {
        throw new AppError('Invalid order ID', 400);
      }

      const order = await this.orderRepository.findOne({ where: { id: idNum } });
      if (!order) {
        return null;
      }

      Object.assign(order, data);
      return await this.orderRepository.save(order);
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
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
      const userIdNum = Number(userId);
      if (!Number.isInteger(userIdNum) || userIdNum <= 0) {
        throw new AppError('Invalid user ID', 400);
      }

      const skip = (page - 1) * limit;

      const [orders, total] = await this.orderRepository.findAndCount({
        where: { userId: userIdNum },
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
      });

      return { orders, total };
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
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
      const idNum = Number(id);
      if (!Number.isInteger(idNum) || idNum <= 0) {
        throw new AppError('Invalid order ID', 400);
      }

      const order = await this.orderRepository.findOne({ where: { id: idNum } });
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

  /**
   * Create order from cart (Checkout)
   */
  async createOrderFromCart(
    userId: string,
    shippingAddress: ShippingAddress,
    paymentMethod: string,
    deliverySlotId?: string,
    notes?: string
  ): Promise<Order> {
    const userIdNum = Number(userId);
    if (!Number.isInteger(userIdNum) || userIdNum <= 0) {
      throw new AppError('Invalid user ID', 400);
    }

    let deliverySlotIdNum: number | undefined;
    if (deliverySlotId) {
      deliverySlotIdNum = Number(deliverySlotId);
      if (!Number.isInteger(deliverySlotIdNum) || deliverySlotIdNum <= 0) {
        throw new AppError('Invalid delivery slot ID', 400);
      }
    }

    const cart = await this.cartRepository.findOne({
      where: { userId: userIdNum },
      relations: ['items', 'items.product'],
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new AppError('Cart is empty', 400);
    }

    for (const item of cart.items) {
      if (!item.product.isActive) {
        throw new AppError(`Product ${item.product.name} is no longer available`, 400);
      }

      if (item.product.stockQuantity < item.quantity) {
        throw new AppError(
          `Insufficient stock for ${item.product.name}. Only ${item.product.stockQuantity} available`,
          400
        );
      }
    }

    const cartSummary = await this.cartService.getCartByUserId(userId);

    const orderNumber = await this.generateOrderNumber();

    const orderItems: OrderItem[] = cart.items.map((item) => ({
      productId: item.productId,
      productName: item.product.name,
      sku: item.product.sku,
      price: Number(item.price),
      quantity: item.quantity,
      subtotal: Number(item.price) * item.quantity,
    }));

    const order = this.orderRepository.create({
      orderNumber,
      userId: userIdNum,
      items: orderItems,
      subtotal: cartSummary.subtotal,
      tax: cartSummary.tax,
      shippingCost: 0,
      discount: cartSummary.discount,
      total: cartSummary.total,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod,
      shippingAddress,
      deliverySlotId: deliverySlotIdNum,
      promoCodeId: cart.promoCodeId,
      notes,
    });

    await this.orderRepository.save(order);

    for (const item of cart.items) {
      const productIdNum = Number(item.productId);
      if (!Number.isInteger(productIdNum) || productIdNum <= 0) {
        throw new AppError(`Invalid product ID in cart: ${item.productId}`, 500);
      }
      await this.productRepository.decrement(
        { id: productIdNum },
        'stockQuantity',
        item.quantity
      );
    }

    if (cart.promoCodeId) {
      await this.cartService.incrementPromotionUsage(cart.promoCodeId.toString());
    }

    await this.cartService.clearCart(userId);

    return order;
  }

  /**
   * Get sales summary for dashboard
   */
  async getSalesSummary(): Promise<{
    todaySales: number;
    todayOrders: number;
    yesterdaySales: number;
    yesterdayOrders: number;
    weekSales: number;
    weekOrders: number;
    monthSales: number;
    monthOrders: number;
    salesGrowth: number;
    ordersGrowth: number;
  }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - 7);

      const monthStart = new Date(today);
      monthStart.setMonth(monthStart.getMonth() - 1);

      const getStats = async (start: Date, end?: Date) => {
        const query = this.orderRepository.createQueryBuilder('order')
          .where('order.createdAt >= :start', { start });

        if (end) {
          query.andWhere('order.createdAt < :end', { end });
        }

        const orders = await query.getMany();
        return {
          count: orders.length,
          revenue: orders.reduce((sum, order) => sum + Number(order.total), 0)
        };
      };

      const todayStats = await getStats(today);
      const yesterdayStats = await getStats(yesterday, today);
      const weekStats = await getStats(weekStart);
      const monthStats = await getStats(monthStart);

      const salesGrowth = yesterdayStats.revenue > 0
        ? ((todayStats.revenue - yesterdayStats.revenue) / yesterdayStats.revenue) * 100
        : 100;

      const ordersGrowth = yesterdayStats.count > 0
        ? ((todayStats.count - yesterdayStats.count) / yesterdayStats.count) * 100
        : 100;

      return {
        todaySales: todayStats.revenue,
        todayOrders: todayStats.count,
        yesterdaySales: yesterdayStats.revenue,
        yesterdayOrders: yesterdayStats.count,
        weekSales: weekStats.revenue,
        weekOrders: weekStats.count,
        monthSales: monthStats.revenue,
        monthOrders: monthStats.count,
        salesGrowth,
        ordersGrowth
      };
    } catch (error) {
      console.error('Error fetching sales summary:', error);
      throw new Error('Failed to fetch sales summary');
    }
  }

  /**
   * Get detailed analytics
   */
  async getAnalytics(): Promise<{
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    topProducts: Array<{
      productId: string;
      productName: string;
      totalSold: number;
      revenue: number;
    }>;
    salesByCategory: Array<{
      category: string;
      revenue: number;
      orderCount: number;
    }>;
  }> {
    try {
      const orders = await this.orderRepository.find({ relations: ['items'] });

      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Top products
      const productStats = new Map<string, { name: string; sold: number; revenue: number }>();

      for (const order of orders) {
        if (!order.items) continue;
        for (const item of order.items) {
          const current = productStats.get(item.productId.toString()) || {
            name: item.productName,
            sold: 0,
            revenue: 0
          };

          productStats.set(item.productId.toString(), {
            name: item.productName,
            sold: current.sold + item.quantity,
            revenue: current.revenue + (Number(item.price) * item.quantity)
          });
        }
      }

      const topProducts = Array.from(productStats.entries())
        .map(([id, stats]) => ({
          productId: id,
          productName: stats.name,
          totalSold: stats.sold,
          revenue: stats.revenue
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Sales by category (simplified as we don't have direct category link in order items easily accessible without more queries)
      // For now returning empty or mock if needed, but let's try to fetch products to get categories
      // This is expensive, in a real app we'd aggregate this in DB
      const salesByCategory: any[] = [];

      return {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        topProducts,
        salesByCategory
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw new Error('Failed to fetch analytics');
    }
  }

  /**
   * Cancel order and restore inventory
   */
  async cancelOrderWithInventoryRestore(id: string, userId: string): Promise<Order> {
    const idNum = Number(id);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      throw new AppError('Invalid order ID', 400);
    }

    const userIdNum = Number(userId);
    if (!Number.isInteger(userIdNum) || userIdNum <= 0) {
      throw new AppError('Invalid user ID', 400);
    }

    const order = await this.orderRepository.findOne({
      where: { id: idNum, userId: userIdNum },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      throw new AppError('Order cannot be cancelled at this stage', 400);
    }

    order.status = 'cancelled';
    await this.orderRepository.save(order);

    for (const item of order.items as OrderItem[]) {
      const productIdNum = Number(item.productId);
      if (!Number.isInteger(productIdNum) || productIdNum <= 0) {
        throw new AppError(`Invalid product ID in order: ${item.productId}`, 500);
      }
      await this.productRepository.increment(
        { id: productIdNum },
        'stockQuantity',
        item.quantity
      );
    }

    return order;
  }
}

export const orderService = new OrderService();
