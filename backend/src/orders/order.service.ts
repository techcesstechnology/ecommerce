import { Order, OrderStatus, PaymentStatus } from '../types';
import { CreateOrderInput, ListOrdersInput, UpdateOrderStatusInput } from './order.validator';
import { cartService } from '../cart/cart.service';
import { redisClient } from '../utils/redis';
import {
  generateOrderId,
  calculateTax,
  calculateShippingCost,
  generateTrackingNumber,
} from '../utils/helpers';
import { wsService } from '../utils/websocket';
import { emailService } from '../notifications/email.service';

const ORDERS_PREFIX = 'orders:';
const USER_ORDERS_PREFIX = 'user_orders:';

export class OrderService {
  private getOrderKey(orderId: string): string {
    return `${ORDERS_PREFIX}${orderId}`;
  }

  private getUserOrdersKey(userId: string): string {
    return `${USER_ORDERS_PREFIX}${userId}`;
  }

  async createOrder(input: CreateOrderInput): Promise<Order> {
    const cart = await cartService.getCart(input.userId);

    if (cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    const orderId = generateOrderId();
    const subtotal = cart.total;
    const tax = calculateTax(subtotal);
    const shippingCost = calculateShippingCost(subtotal, input.currency);
    const total = subtotal + tax + shippingCost;

    const order: Order = {
      id: orderId,
      userId: input.userId,
      items: cart.items,
      subtotal,
      tax,
      shippingCost,
      total,
      currency: input.currency,
      status: OrderStatus.PENDING,
      paymentMethod: input.paymentMethod,
      paymentStatus: PaymentStatus.PENDING,
      shippingAddress: input.shippingAddress,
      notes: input.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.saveOrder(order);
    await this.addOrderToUserList(input.userId, orderId);
    await cartService.clearCart(input.userId);

    // Send notifications
    wsService.notifyUser(input.userId, {
      type: 'order_created',
      data: order,
    });

    await emailService.sendOrderConfirmation(order);

    return order;
  }

  async getOrder(orderId: string, userId: string): Promise<Order | null> {
    const orderKey = this.getOrderKey(orderId);
    const orderData = await redisClient.get(orderKey);

    if (!orderData) {
      return null;
    }

    const order: Order = JSON.parse(orderData);

    if (order.userId !== userId) {
      throw new Error('Unauthorized access to order');
    }

    return order;
  }

  async listOrders(input: ListOrdersInput): Promise<{ orders: Order[]; total: number }> {
    const userOrdersKey = this.getUserOrdersKey(input.userId);
    const orderIdsData = await redisClient.get(userOrdersKey);

    if (!orderIdsData) {
      return { orders: [], total: 0 };
    }

    const orderIds: string[] = JSON.parse(orderIdsData);
    const orders: Order[] = [];

    for (const orderId of orderIds) {
      const orderKey = this.getOrderKey(orderId);
      const orderData = await redisClient.get(orderKey);
      
      if (orderData) {
        const order: Order = JSON.parse(orderData);
        
        if (!input.status || order.status === input.status) {
          orders.push(order);
        }
      }
    }

    orders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const start = (input.page - 1) * input.limit;
    const end = start + input.limit;
    const paginatedOrders = orders.slice(start, end);

    return {
      orders: paginatedOrders,
      total: orders.length,
    };
  }

  async updateOrderStatus(input: UpdateOrderStatusInput): Promise<Order> {
    const orderKey = this.getOrderKey(input.orderId);
    const orderData = await redisClient.get(orderKey);

    if (!orderData) {
      throw new Error('Order not found');
    }

    const order: Order = JSON.parse(orderData);
    order.status = input.status;
    order.updatedAt = new Date();

    if (input.trackingNumber) {
      order.trackingNumber = input.trackingNumber;
    } else if (input.status === OrderStatus.SHIPPED && !order.trackingNumber) {
      order.trackingNumber = generateTrackingNumber();
    }

    await this.saveOrder(order);

    // Send notifications
    wsService.notifyUser(order.userId, {
      type: 'order_status_updated',
      data: order,
    });

    await emailService.sendOrderStatusUpdate(order);

    return order;
  }

  async updatePaymentStatus(orderId: string, status: PaymentStatus): Promise<Order> {
    const orderKey = this.getOrderKey(orderId);
    const orderData = await redisClient.get(orderKey);

    if (!orderData) {
      throw new Error('Order not found');
    }

    const order: Order = JSON.parse(orderData);
    order.paymentStatus = status;
    order.updatedAt = new Date();

    if (status === PaymentStatus.COMPLETED) {
      order.status = OrderStatus.CONFIRMED;
    }

    await this.saveOrder(order);

    wsService.notifyUser(order.userId, {
      type: 'payment_status_updated',
      data: order,
    });

    return order;
  }

  private async saveOrder(order: Order): Promise<void> {
    const orderKey = this.getOrderKey(order.id);
    const orderData = JSON.stringify(order);
    await redisClient.set(orderKey, orderData);
  }

  private async addOrderToUserList(userId: string, orderId: string): Promise<void> {
    const userOrdersKey = this.getUserOrdersKey(userId);
    const orderIdsData = await redisClient.get(userOrdersKey);

    let orderIds: string[] = [];
    if (orderIdsData) {
      orderIds = JSON.parse(orderIdsData);
    }

    orderIds.push(orderId);
    await redisClient.set(userOrdersKey, JSON.stringify(orderIds));
  }
}

export const orderService = new OrderService();
