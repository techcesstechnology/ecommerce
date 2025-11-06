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
};
