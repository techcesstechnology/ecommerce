import api from '../api';
import { Order, ApiResponse, PaginatedResponse } from '../../types';

export const orderService = {
  // Get all orders with filters
  getOrders: async (params?: {
    status?: string;
    paymentStatus?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<PaginatedResponse<Order>>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    return api.get(`/orders?${queryParams.toString()}`, {
      headers: { 'x-admin-role': 'admin' },
    });
  },

  // Get order by ID
  getOrder: async (id: string): Promise<ApiResponse<Order>> => {
    return api.get(`/orders/${id}`);
  },

  // Update order
  updateOrder: async (
    id: string,
    data: { status?: string; paymentStatus?: string; notes?: string }
  ): Promise<ApiResponse<Order>> => {
    return api.put(`/orders/${id}`, data, {
      headers: { 'x-admin-role': 'admin' },
    });
  },

  // Cancel order
  cancelOrder: async (id: string): Promise<ApiResponse<Order>> => {
    return api.post(`/orders/${id}/cancel`);
  },

  // Get order statistics
  getStats: async (): Promise<
    ApiResponse<{
      total: number;
      pending: number;
      confirmed: number;
      processing: number;
      shipped: number;
      delivered: number;
      cancelled: number;
      totalRevenue: number;
      averageOrderValue: number;
    }>
  > => {
    return api.get('/orders/stats', {
      headers: { 'x-admin-role': 'admin' },
    });
  },
};
