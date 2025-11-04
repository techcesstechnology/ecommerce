import { v4 as uuidv4 } from 'uuid';
import {
  Order,
  CreateOrderDto,
  UpdateOrderStatusDto,
  OrderFilters,
  RefundRequest,
  ReturnRequest,
} from '../models/order.model';
import { paymentService } from './payment.service';
import { productService } from './product.service';

// In-memory storage for orders
const ordersStore = new Map<string, Order>();
const returnsStore = new Map<string, ReturnRequest>();

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export class OrderService {
  /**
   * Create a new order
   */
  async createOrder(data: CreateOrderDto, userId?: string): Promise<Order> {
    // Validate items
    if (!data.items || data.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    // Calculate order totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of data.items) {
      const product = await productService.getProductById(item.productId);

      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      if (product.status !== 'published') {
        throw new Error(`Product ${product.name} is not available`);
      }

      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
        );
      }

      const itemSubtotal = item.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        id: uuidv4(),
        productId: product.id,
        productName: product.name,
        productImage: product.images[0],
        quantity: item.quantity,
        price: item.price,
        subtotal: itemSubtotal,
      });

      // Update product stock
      await productService.updateProduct(product.id, {
        stock: product.stock - item.quantity,
      });
    }

    const discount = 0; // Apply discount if code provided
    const tax = Math.round(subtotal * 0.15 * 100) / 100; // 15% tax
    const shipping = subtotal >= 100 ? 0 : 5; // Free shipping over $100
    const total = subtotal - discount + tax + shipping;

    const now = new Date();
    const order: Order = {
      id: uuidv4(),
      orderNumber: this.generateOrderNumber(),
      userId,
      items: orderItems,
      subtotal,
      discount,
      tax,
      shipping,
      total,
      currency: 'USD',
      discountCode: data.discountCode,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: data.paymentMethod,
      shippingAddress: data.shippingAddress,
      billingAddress: data.billingAddress || data.shippingAddress,
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    };

    ordersStore.set(order.id, order);

    return order;
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string): Promise<Order | undefined> {
    return ordersStore.get(orderId);
  }

  /**
   * Get orders with filters
   */
  async getOrders(filters: OrderFilters): Promise<PaginatedResponse<Order>> {
    let orders = Array.from(ordersStore.values());

    // Apply filters
    if (filters.userId) {
      orders = orders.filter((o) => o.userId === filters.userId);
    }

    if (filters.status) {
      orders = orders.filter((o) => o.status === filters.status);
    }

    if (filters.paymentStatus) {
      orders = orders.filter((o) => o.paymentStatus === filters.paymentStatus);
    }

    if (filters.startDate) {
      orders = orders.filter((o) => new Date(o.createdAt) >= filters.startDate!);
    }

    if (filters.endDate) {
      orders = orders.filter((o) => new Date(o.createdAt) <= filters.endDate!);
    }

    // Sorting
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';

    orders.sort((a, b) => {
      const aValue = a[sortBy as keyof Order];
      const bValue = b[sortBy as keyof Order];

      if (aValue !== undefined && bValue !== undefined) {
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });

    // Pagination
    const page = filters.page || 1;
    const perPage = filters.limit || 10;
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedOrders = orders.slice(startIndex, endIndex);

    return {
      items: paginatedOrders,
      total: orders.length,
      page,
      perPage,
      totalPages: Math.ceil(orders.length / perPage),
    };
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, data: UpdateOrderStatusDto): Promise<Order> {
    const order = ordersStore.get(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    order.status = data.status;
    order.updatedAt = new Date();

    if (data.trackingNumber) {
      order.trackingNumber = data.trackingNumber;
    }

    if (data.estimatedDelivery) {
      order.estimatedDelivery = data.estimatedDelivery;
    }

    if (data.status === 'cancelled') {
      order.cancelledAt = new Date();
      // Restore product stock
      for (const item of order.items) {
        const product = await productService.getProductById(item.productId);
        if (product) {
          await productService.updateProduct(product.id, {
            stock: product.stock + item.quantity,
          });
        }
      }
    }

    if (data.status === 'delivered') {
      order.deliveredAt = new Date();
    }

    ordersStore.set(orderId, order);

    return order;
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string): Promise<Order> {
    const order = ordersStore.get(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status === 'delivered' || order.status === 'cancelled') {
      throw new Error(`Cannot cancel order with status: ${order.status}`);
    }

    return this.updateOrderStatus(orderId, { status: 'cancelled' });
  }

  /**
   * Request refund
   */
  async requestRefund(request: RefundRequest): Promise<Order> {
    const order = ordersStore.get(request.orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'delivered') {
      throw new Error('Can only refund delivered orders');
    }

    // Process refund
    await paymentService.processRefund({
      transactionId: order.id,
      amount: request.amount || order.total,
      reason: request.reason,
    });

    order.status = 'refunded';
    order.paymentStatus = 'refunded';
    order.updatedAt = new Date();

    // Restore product stock if full refund
    if (!request.items || request.items.length === order.items.length) {
      for (const item of order.items) {
        const product = await productService.getProductById(item.productId);
        if (product) {
          await productService.updateProduct(product.id, {
            stock: product.stock + item.quantity,
          });
        }
      }
    }

    ordersStore.set(order.id, order);

    return order;
  }

  /**
   * Request return
   */
  async requestReturn(request: ReturnRequest): Promise<{ id: string; status: string }> {
    const order = ordersStore.get(request.orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'delivered') {
      throw new Error('Can only return delivered orders');
    }

    const returnId = uuidv4();
    returnsStore.set(returnId, request);

    return {
      id: returnId,
      status: 'pending',
    };
  }

  /**
   * Get order tracking information
   */
  async getOrderTracking(orderId: string): Promise<{
    orderNumber: string;
    status: string;
    trackingNumber?: string;
    history: Array<{
      status: string;
      timestamp: Date;
      description: string;
    }>;
  }> {
    const order = ordersStore.get(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    const history = [
      {
        status: 'pending',
        timestamp: order.createdAt,
        description: 'Order placed',
      },
    ];

    if (order.status === 'confirmed' || order.status === 'processing') {
      history.push({
        status: 'confirmed',
        timestamp: order.updatedAt,
        description: 'Order confirmed',
      });
    }

    if (order.status === 'shipped' || order.status === 'delivered') {
      history.push({
        status: 'shipped',
        timestamp: order.updatedAt,
        description: 'Order shipped',
      });
    }

    if (order.status === 'delivered') {
      history.push({
        status: 'delivered',
        timestamp: order.deliveredAt || order.updatedAt,
        description: 'Order delivered',
      });
    }

    if (order.status === 'cancelled') {
      history.push({
        status: 'cancelled',
        timestamp: order.cancelledAt || order.updatedAt,
        description: 'Order cancelled',
      });
    }

    return {
      orderNumber: order.orderNumber,
      status: order.status,
      trackingNumber: order.trackingNumber,
      history,
    };
  }

  /**
   * Generate order number
   */
  private generateOrderNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `ORD-${year}${month}${day}-${random}`;
  }
}

export const orderService = new OrderService();
