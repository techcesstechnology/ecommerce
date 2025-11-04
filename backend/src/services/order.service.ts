import { v4 as uuidv4 } from 'uuid';
import {
  Order,
  CreateOrderDto,
  UpdateOrderDto,
  OrderFilters,
  OrderItem,
} from '../models/order.model';
import { productService } from './product.service';

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

// In-memory storage for orders (replace with database in production)
const ordersStore = new Map<string, Order>();
let orderCounter = 1000;

export class OrderService {
  /**
   * Get all orders with optional filters and pagination
   */
  async getOrders(filters: OrderFilters): Promise<PaginatedResponse<Order>> {
    let orders = Array.from(ordersStore.values());

    // Apply filters
    if (filters.status) {
      orders = orders.filter((o) => o.status === filters.status);
    }

    if (filters.paymentStatus) {
      orders = orders.filter((o) => o.paymentStatus === filters.paymentStatus);
    }

    if (filters.userId) {
      orders = orders.filter((o) => o.userId === filters.userId);
    }

    if (filters.startDate) {
      const startDate = filters.startDate;
      orders = orders.filter((o) => o.createdAt >= startDate);
    }

    if (filters.endDate) {
      const endDate = filters.endDate;
      orders = orders.filter((o) => o.createdAt <= endDate);
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
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedOrders = orders.slice(startIndex, endIndex);
    const total = orders.length;
    const totalPages = Math.ceil(total / limit);

    return {
      items: paginatedOrders,
      total,
      page,
      perPage: limit,
      totalPages,
    };
  }

  /**
   * Get an order by ID
   */
  async getOrderById(id: string): Promise<Order | null> {
    return ordersStore.get(id) || null;
  }

  /**
   * Get an order by order number
   */
  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    const orders = Array.from(ordersStore.values());
    return orders.find((o) => o.orderNumber === orderNumber) || null;
  }

  /**
   * Create a new order
   */
  async createOrder(data: CreateOrderDto): Promise<Order> {
    const items: OrderItem[] = [];
    let subtotal = 0;

    // Process each item
    for (const item of data.items) {
      const product = await productService.getProductById(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product: ${product.name}`);
      }

      const itemSubtotal = product.price * item.quantity;
      items.push({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: item.quantity,
        price: product.price,
        subtotal: itemSubtotal,
      });

      subtotal += itemSubtotal;

      // Update product stock
      await productService.updateStock(product.id, product.stock - item.quantity);
    }

    // Calculate totals
    const tax = subtotal * 0.15; // 15% tax
    const shippingCost = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const total = subtotal + tax + shippingCost;

    const now = new Date();
    const order: Order = {
      id: uuidv4(),
      orderNumber: `ORD-${orderCounter++}`,
      userId: data.userId,
      items,
      subtotal,
      tax,
      shippingCost,
      total,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: data.paymentMethod,
      shippingAddress: data.shippingAddress,
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    };

    ordersStore.set(order.id, order);
    return order;
  }

  /**
   * Update an order
   */
  async updateOrder(id: string, data: UpdateOrderDto): Promise<Order | null> {
    const order = ordersStore.get(id);
    if (!order) {
      return null;
    }

    const updatedOrder: Order = {
      ...order,
      ...data,
      updatedAt: new Date(),
    };

    ordersStore.set(id, updatedOrder);
    return updatedOrder;
  }

  /**
   * Cancel an order
   */
  async cancelOrder(id: string): Promise<Order | null> {
    const order = ordersStore.get(id);
    if (!order) {
      return null;
    }

    if (order.status === 'delivered' || order.status === 'cancelled') {
      throw new Error('Cannot cancel order in current status');
    }

    // Restore product stock
    for (const item of order.items) {
      const product = await productService.getProductById(item.productId);
      if (product) {
        await productService.updateStock(product.id, product.stock + item.quantity);
      }
    }

    return this.updateOrder(id, { status: 'cancelled' });
  }

  /**
   * Get orders by user
   */
  async getOrdersByUser(userId: string): Promise<Order[]> {
    const orders = Array.from(ordersStore.values());
    return orders.filter((o) => o.userId === userId);
  }

  /**
   * Get order statistics
   */
  async getOrderStats() {
    const orders = Array.from(ordersStore.values());

    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      confirmed: orders.filter((o) => o.status === 'confirmed').length,
      processing: orders.filter((o) => o.status === 'processing').length,
      shipped: orders.filter((o) => o.status === 'shipped').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
      totalRevenue: orders
        .filter((o) => o.paymentStatus === 'paid')
        .reduce((sum, o) => sum + o.total, 0),
      averageOrderValue:
        orders.length > 0 ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length : 0,
    };
  }
}

export const orderService = new OrderService();
