import { api } from './api';
import { ApiResponse } from '../types';

export interface SalesMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueGrowth: number;
  ordersGrowth: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  sku: string;
  totalSold: number;
  revenue: number;
  category: string;
}

export interface CategorySales {
  category: string;
  revenue: number;
  orderCount: number;
  productCount: number;
  averageOrderValue: number;
}

export interface RevenueOverTime {
  date: string;
  revenue: number;
  orders: number;
}

export interface InventoryMetrics {
  totalProducts: number;
  activeProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalInventoryValue: number;
  averageStockLevel: number;
}

export const analyticsService = {
  async getSalesMetrics(startDate?: string, endDate?: string) {
    const response = await api.get<ApiResponse<SalesMetrics>>('/analytics/sales-metrics', {
      params: { startDate, endDate },
    });
    return response.data.data;
  },

  async getTopProducts(limit: number = 10, startDate?: string, endDate?: string) {
    const response = await api.get<ApiResponse<TopProduct[]>>('/analytics/top-products', {
      params: { limit, startDate, endDate },
    });
    return response.data.data;
  },

  async getSalesByCategory(startDate?: string, endDate?: string) {
    const response = await api.get<ApiResponse<CategorySales[]>>('/admin/analytics/sales-by-category', {
      params: { startDate, endDate },
    });
    return response.data.data;
  },

  async getRevenueOverTime(period: 'day' | 'week' | 'month' = 'day', startDate?: string, endDate?: string) {
    const response = await api.get<ApiResponse<RevenueOverTime[]>>('/admin/analytics/revenue-over-time', {
      params: { period, startDate, endDate },
    });
    return response.data.data;
  },

  async getInventoryMetrics() {
    const response = await api.get<ApiResponse<InventoryMetrics>>('/analytics/inventory-metrics');
    return response.data.data;
  },
};
