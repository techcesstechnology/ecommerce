// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  category: string;
  tags: string[];
  stock: number;
  sku: string;
  status: 'draft' | 'published' | 'archived';
  features: string[];
  specifications: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  images?: string[];
  category: string;
  tags?: string[];
  stock: number;
  sku: string;
  status?: 'draft' | 'published' | 'archived';
  features?: string[];
  specifications?: Record<string, string>;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  comparePrice?: number;
  images?: string[];
  category?: string;
  tags?: string[];
  stock?: number;
  sku?: string;
  status?: 'draft' | 'published' | 'archived';
  features?: string[];
  specifications?: Record<string, string>;
}

// Category types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  image?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

// Order types
export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode?: string;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Dashboard types
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
  recentProducts: Array<{
    id: string;
    name: string;
    sku: string;
    price: number;
    stock: number;
    status: string;
    createdAt: Date;
  }>;
}

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

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
