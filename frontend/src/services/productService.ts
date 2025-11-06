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
};
