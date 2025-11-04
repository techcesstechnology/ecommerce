import api from '../api';
import { DashboardStats, ApiResponse, ProductPerformance } from '../../types';

export const adminService = {
  // Get dashboard statistics
  getDashboardStats: async (): Promise<ApiResponse<DashboardStats>> => {
    return api.get('/admin/dashboard/stats', {
      headers: { 'x-admin-role': 'admin' },
    });
  },

  // Get inventory alerts
  getInventoryAlerts: async (): Promise<
    ApiResponse<
      Array<{
        productId: string;
        productName: string;
        sku: string;
        currentStock: number;
        alertType: 'low_stock' | 'out_of_stock';
      }>
    >
  > => {
    return api.get('/admin/dashboard/inventory-alerts', {
      headers: { 'x-admin-role': 'admin' },
    });
  },

  // Get sales summary
  getSalesSummary: async (): Promise<
    ApiResponse<{
      totalSales: number;
      totalOrders: number;
      averageOrderValue: number;
      revenue: number;
      pendingOrders: number;
      completedOrders: number;
      topProducts: ProductPerformance[];
    }>
  > => {
    return api.get('/admin/dashboard/sales-summary', {
      headers: { 'x-admin-role': 'admin' },
    });
  },

  // Get comprehensive analytics
  getAnalytics: async (): Promise<
    ApiResponse<{
      today: {
        totalRevenue: number;
        totalOrders: number;
        averageOrderValue: number;
      };
      week: {
        totalRevenue: number;
        totalOrders: number;
        averageOrderValue: number;
      };
      month: {
        totalRevenue: number;
        totalOrders: number;
        averageOrderValue: number;
      };
      topProducts: ProductPerformance[];
      recentOrders: number;
      pendingOrders: number;
      completedOrders: number;
    }>
  > => {
    return api.get('/admin/analytics', {
      headers: { 'x-admin-role': 'admin' },
    });
  },

  // Get sales by category
  getSalesByCategory: async (): Promise<
    ApiResponse<
      Array<{
        category: string;
        revenue: number;
        orders: number;
      }>
    >
  > => {
    return api.get('/admin/analytics/sales-by-category', {
      headers: { 'x-admin-role': 'admin' },
    });
  },

  // Get revenue over time
  getRevenueOverTime: async (
    period: 'day' | 'week' | 'month' = 'day',
    limit = 30
  ): Promise<
    ApiResponse<
      Array<{
        date: string;
        revenue: number;
      }>
    >
  > => {
    return api.get(`/admin/analytics/revenue-over-time?period=${period}&limit=${limit}`, {
      headers: { 'x-admin-role': 'admin' },
    });
  },
};
