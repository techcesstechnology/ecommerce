import { productService } from './product.service';
import { categoryService } from './category.service';
import { Product } from '../models/product.model';

export interface RecentProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  status: string;
  createdAt: Date;
}

export interface DashboardStats {
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  archivedProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalCategories: number;
  activeCategories: number;
  totalInventoryValue: number;
  recentProducts: RecentProduct[];
}

export interface InventoryAlert {
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  alertType: 'low_stock' | 'out_of_stock';
}

export class AdminService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    // Get all products
    const allProducts = await productService.getProducts({ limit: 1000 });
    const products = allProducts.items;

    // Calculate product statistics
    const publishedProducts = products.filter((p: Product) => p.status === 'published').length;
    const draftProducts = products.filter((p: Product) => p.status === 'draft').length;
    const archivedProducts = products.filter((p: Product) => p.status === 'archived').length;

    // Stock statistics
    const lowStockProducts = products.filter((p: Product) => p.stock > 0 && p.stock <= 10).length;
    const outOfStockProducts = products.filter((p: Product) => p.stock === 0).length;

    // Calculate total inventory value
    const totalInventoryValue = products.reduce(
      (sum: number, p: Product) => sum + p.price * p.stock,
      0
    );

    // Get all categories
    const categories = await categoryService.getCategories();
    const activeCategories = categories.filter((c) => c.status === 'active').length;

    // Get recent products (last 5)
    const recentProducts = products
      .sort((a: Product, b: Product) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)
      .map((p: Product) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        price: p.price,
        stock: p.stock,
        status: p.status,
        createdAt: p.createdAt,
      }));

    return {
      totalProducts: products.length,
      publishedProducts,
      draftProducts,
      archivedProducts,
      lowStockProducts,
      outOfStockProducts,
      totalCategories: categories.length,
      activeCategories,
      totalInventoryValue,
      recentProducts,
    };
  }

  /**
   * Get inventory alerts for low stock and out of stock products
   */
  async getInventoryAlerts(): Promise<InventoryAlert[]> {
    const allProducts = await productService.getProducts({ limit: 1000 });
    const products = allProducts.items;

    const alerts: InventoryAlert[] = [];

    for (const product of products) {
      if (product.stock === 0) {
        alerts.push({
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          currentStock: product.stock,
          alertType: 'out_of_stock',
        });
      } else if (product.stock <= 10) {
        alerts.push({
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          currentStock: product.stock,
          alertType: 'low_stock',
        });
      }
    }

    return alerts.sort((a, b) => a.currentStock - b.currentStock);
  }

  /**
   * Get sales summary (placeholder for future implementation)
   */
  async getSalesSummary() {
    // TODO: Implement when order management is added
    return {
      totalSales: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      revenue: 0,
    };
  }
}

export const adminService = new AdminService();
