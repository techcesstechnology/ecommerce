import { api } from './api';
import { ApiResponse } from '../types';

export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalCategories: number;
  activeCategories: number;
  totalInventoryValue: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  todayRevenue: number;
}

export interface InventoryAlert {
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  minimumStock: number;
  status: 'low' | 'out';
}

export interface SalesSummary {
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
}

export interface AnalyticsOverview {
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
}

export const adminService = {
  async getDashboardStats() {
    const response = await api.get<ApiResponse<DashboardStats>>('/admin/dashboard/stats');
    return response.data.data;
  },

  async getInventoryAlerts() {
    const response = await api.get<ApiResponse<InventoryAlert[]>>('/admin/dashboard/inventory-alerts');
    return response.data.data;
  },

  async getSalesSummary() {
    const response = await api.get<ApiResponse<SalesSummary>>('/admin/dashboard/sales-summary');
    return response.data.data;
  },

  async getAnalytics() {
    const response = await api.get<ApiResponse<AnalyticsOverview>>('/admin/analytics');
    return response.data.data;
  },
};
