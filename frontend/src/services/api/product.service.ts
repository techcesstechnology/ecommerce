import api from '../api';
import {
  Product,
  CreateProductDto,
  UpdateProductDto,
  ApiResponse,
  PaginatedResponse,
} from '../../types';

export const productService = {
  // Get all products with filters
  getProducts: async (params?: {
    category?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    tags?: string[];
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<PaginatedResponse<Product>>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            queryParams.append(key, value.join(','));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }
    return api.get(`/products?${queryParams.toString()}`);
  },

  // Get product by ID
  getProduct: async (id: string): Promise<ApiResponse<Product>> => {
    return api.get(`/products/${id}`);
  },

  // Create product
  createProduct: async (data: CreateProductDto): Promise<ApiResponse<Product>> => {
    return api.post('/products', data, {
      headers: { 'x-admin-role': 'admin' },
    });
  },

  // Update product
  updateProduct: async (id: string, data: UpdateProductDto): Promise<ApiResponse<Product>> => {
    return api.put(`/products/${id}`, data, {
      headers: { 'x-admin-role': 'admin' },
    });
  },

  // Delete product
  deleteProduct: async (id: string): Promise<ApiResponse<null>> => {
    return api.delete(`/products/${id}`, {
      headers: { 'x-admin-role': 'admin' },
    });
  },

  // Update product stock
  updateStock: async (id: string, stock: number): Promise<ApiResponse<Product>> => {
    return api.patch(
      `/products/${id}/stock`,
      { stock },
      {
        headers: { 'x-admin-role': 'admin' },
      }
    );
  },

  // Get low stock products
  getLowStockProducts: async (threshold?: number): Promise<ApiResponse<Product[]>> => {
    const url = threshold ? `/products/low-stock?threshold=${threshold}` : '/products/low-stock';
    return api.get(url);
  },

  // Bulk operations
  bulkCreate: async (
    products: CreateProductDto[]
  ): Promise<
    ApiResponse<{
      created: Product[];
      errors: Array<{ index: number; sku: string; error: string }>;
    }>
  > => {
    return api.post('/products/bulk/create', products, {
      headers: { 'x-admin-role': 'admin' },
    });
  },

  bulkUpdate: async (
    updates: Array<{ id: string; data: UpdateProductDto }>
  ): Promise<
    ApiResponse<{
      updated: Product[];
      errors: Array<{ id: string; error: string }>;
    }>
  > => {
    return api.post('/products/bulk/update', updates, {
      headers: { 'x-admin-role': 'admin' },
    });
  },

  bulkDelete: async (
    ids: string[]
  ): Promise<
    ApiResponse<{
      deleted: string[];
      errors: Array<{ id: string; error: string }>;
    }>
  > => {
    return api.post(
      '/products/bulk/delete',
      { ids },
      {
        headers: { 'x-admin-role': 'admin' },
      }
    );
  },
};
