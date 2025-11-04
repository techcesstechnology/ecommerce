import { orderService } from './order.service';
import { productService } from './product.service';

export interface SalesMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueGrowth: number;
  ordersGrowth: number;
}

export interface ProductPerformance {
  productId: string;
  productName: string;
  sku: string;
  totalSold: number;
  revenue: number;
  averagePrice: number;
}

export interface SalesAnalytics {
  today: SalesMetrics;
  week: SalesMetrics;
  month: SalesMetrics;
  year: SalesMetrics;
  topProducts: ProductPerformance[];
  recentOrders: number;
  pendingOrders: number;
  completedOrders: number;
}

export class AnalyticsService {
  /**
   * Get comprehensive sales analytics
   */
  async getSalesAnalytics(): Promise<SalesAnalytics> {
    const orderStats = await orderService.getOrderStats();
    const topProducts = await this.getTopProducts(5);

    // In a real implementation, you would calculate these based on actual date ranges
    const metrics: SalesMetrics = {
      totalRevenue: orderStats.totalRevenue,
      totalOrders: orderStats.total,
      averageOrderValue: orderStats.averageOrderValue,
      revenueGrowth: 0, // Would calculate based on previous period
      ordersGrowth: 0, // Would calculate based on previous period
    };

    return {
      today: metrics,
      week: metrics,
      month: metrics,
      year: metrics,
      topProducts,
      recentOrders: orderStats.pending + orderStats.confirmed + orderStats.processing,
      pendingOrders: orderStats.pending,
      completedOrders: orderStats.delivered,
    };
  }

  /**
   * Get top performing products
   */
  async getTopProducts(limit: number = 10): Promise<ProductPerformance[]> {
    const allOrders = await orderService.getOrders({ limit: 1000 });
    const orders = allOrders.items;

    const productStats = new Map<string, ProductPerformance>();

    for (const order of orders) {
      if (order.status !== 'cancelled') {
        for (const item of order.items) {
          const existing = productStats.get(item.productId);
          if (existing) {
            existing.totalSold += item.quantity;
            existing.revenue += item.subtotal;
            existing.averagePrice =
              (existing.averagePrice * (existing.totalSold - item.quantity) +
                item.price * item.quantity) /
              existing.totalSold;
          } else {
            productStats.set(item.productId, {
              productId: item.productId,
              productName: item.productName,
              sku: item.sku,
              totalSold: item.quantity,
              revenue: item.subtotal,
              averagePrice: item.price,
            });
          }
        }
      }
    }

    return Array.from(productStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }

  /**
   * Get sales by category
   */
  async getSalesByCategory() {
    const allOrders = await orderService.getOrders({ limit: 1000 });

    const categoryStats = new Map<string, { category: string; revenue: number; orders: number }>();

    for (const order of allOrders.items) {
      if (order.status !== 'cancelled') {
        for (const item of order.items) {
          const product = await productService.getProductById(item.productId);
          if (product) {
            const existing = categoryStats.get(product.category);
            if (existing) {
              existing.revenue += item.subtotal;
              existing.orders += 1;
            } else {
              categoryStats.set(product.category, {
                category: product.category,
                revenue: item.subtotal,
                orders: 1,
              });
            }
          }
        }
      }
    }

    return Array.from(categoryStats.values()).sort((a, b) => b.revenue - a.revenue);
  }

  /**
   * Get revenue over time
   */
  async getRevenueOverTime(_period: 'day' | 'week' | 'month' = 'day', limit: number = 30) {
    const allOrders = await orderService.getOrders({ limit: 1000 });
    const orders = allOrders.items.filter((o) => o.paymentStatus === 'paid');

    // Group orders by date
    const revenueByDate = new Map<string, number>();

    for (const order of orders) {
      const date = order.createdAt.toISOString().split('T')[0];
      const existing = revenueByDate.get(date) || 0;
      revenueByDate.set(date, existing + order.total);
    }

    return Array.from(revenueByDate.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-limit);
  }

  /**
   * Get inventory turnover metrics
   */
  async getInventoryMetrics() {
    const allProducts = await productService.getProducts({ limit: 1000 });
    const lowStockProducts = await productService.getLowStockProducts(10);

    const totalInventoryValue = allProducts.items.reduce((sum, p) => sum + p.price * p.stock, 0);

    return {
      totalProducts: allProducts.total,
      totalInventoryValue,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: allProducts.items.filter((p) => p.stock === 0).length,
      averageStockLevel:
        allProducts.total > 0
          ? allProducts.items.reduce((sum, p) => sum + p.stock, 0) / allProducts.total
          : 0,
    };
  }
}

export const analyticsService = new AnalyticsService();
