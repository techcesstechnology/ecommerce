import { api } from './api';
import { Order, ShippingAddress, ApiResponse } from '../types';

export interface CheckoutData {
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  deliverySlotId?: string;
  deliveryDate?: Date;
  deliveryTimeStart?: string;
  deliveryTimeEnd?: string;
  notes?: string;
}

export interface OrderFilters {
  status?: string;
  paymentStatus?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'orderDate' | 'totalAmount' | 'status';
  sortOrder?: 'ASC' | 'DESC';
}

export interface UpdateOrderDto {
  status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  trackingNumber?: string;
  notes?: string;
}

export const orderService = {
  async checkout(data: CheckoutData) {
    const response = await api.post<ApiResponse<Order>>('/orders/checkout', data);
    return response.data.data;
  },

  async getMyOrders(page: number = 1, limit: number = 10) {
    const response = await api.get<ApiResponse<{ orders: Order[]; total: number }>>('/orders', {
      params: { page, limit },
    });
    return response.data.data;
  },

  async getOrderById(id: string) {
    const response = await api.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data.data;
  },

  async getOrderByNumber(orderNumber: string) {
    const response = await api.get<ApiResponse<Order>>(`/orders/number/${orderNumber}`);
    return response.data.data;
  },

  async cancelOrder(id: string) {
    const response = await api.put<ApiResponse<Order>>(`/orders/${id}/cancel`);
    return response.data.data;
  },

  async getOrderStats() {
    const response = await api.get<ApiResponse<any>>('/orders/stats');
    return response.data.data;
  },

  async getAllOrders(filters: OrderFilters = {}) {
    const response = await api.get<ApiResponse<{ orders: Order[]; total: number; page: number; totalPages: number }>>('/orders/all', {
      params: filters,
    });
    return response.data.data;
  },

  async updateOrder(id: string, data: UpdateOrderDto) {
    const response = await api.put<ApiResponse<Order>>(`/orders/${id}`, data);
    return response.data.data;
  },
};
