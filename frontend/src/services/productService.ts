import { api } from './api';
import { Product, ApiResponse, PaginatedResponse } from '../types';

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
  inStock?: boolean;
  search?: string;
  sortBy?: 'name' | 'price' | 'rating' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface CreateProductDto {
  name: string;
  description: string;
  sku: string;
  category: string;
  subcategory?: string;
  price: number;
  salePrice?: number;
  costPrice?: number;
  stock: number;
  minimumStock?: number;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  images?: string[];
  tags?: string[];
  specifications?: Record<string, string>;
  status?: 'active' | 'inactive' | 'draft';
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface BulkStockUpdate {
  productId: string;
  stock: number;
}

export const productService = {
  async getProducts(filters: ProductFilters = {}) {
    const response = await api.get<ApiResponse<PaginatedResponse<Product>>>('/products', {
      params: filters,
    });
    return response.data.data;
  },

  async getProductById(id: string) {
    const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data.data;
  },

  async getProductBySku(sku: string) {
    const response = await api.get<ApiResponse<Product>>(`/products/sku/${sku}`);
    return response.data.data;
  },

  async getRelatedProducts(id: string) {
    const response = await api.get<ApiResponse<Product[]>>(`/products/${id}/related`);
    return response.data.data;
  },

  async getFeaturedProducts() {
    const response = await api.get<ApiResponse<Product[]>>('/products/featured');
    return response.data.data;
  },

  async getCategories() {
    const response = await api.get<ApiResponse<string[]>>('/products/categories');
    return response.data.data;
  },

  async searchProducts(query: string) {
    const response = await api.get<ApiResponse<PaginatedResponse<Product>>>('/products/search', {
      params: { q: query },
    });
    return response.data.data;
  },

  async getLowStockProducts() {
    const response = await api.get<ApiResponse<Product[]>>('/products/low-stock');
    return response.data.data;
  },

  async createProduct(data: CreateProductDto) {
    const response = await api.post<ApiResponse<Product>>('/products', data);
    return response.data.data;
  },

  async updateProduct(id: string, data: UpdateProductDto) {
    const response = await api.put<ApiResponse<Product>>(`/products/${id}`, data);
    return response.data.data;
  },

  async deleteProduct(id: string) {
    const response = await api.delete<ApiResponse<void>>(`/products/${id}`);
    return response.data;
  },

  async updateStock(id: string, stock: number) {
    const response = await api.patch<ApiResponse<Product>>(`/products/${id}/stock`, { stock });
    return response.data.data;
  },

  async bulkUpdateStock(updates: BulkStockUpdate[]) {
    const response = await api.post<ApiResponse<void>>('/products/bulk/update-stock', { updates });
    return response.data;
  },

  async bulkDeleteProducts(productIds: string[]) {
    const response = await api.post<ApiResponse<void>>('/products/bulk/delete', { productIds });
    return response.data;
  },
};
