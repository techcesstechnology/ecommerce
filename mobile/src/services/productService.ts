import { api, ApiResponse } from './api';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  stock: number;
  category: string;
  averageRating?: number;
  reviewCount?: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export const productService = {
  async getProducts(page: number = 1, limit: number = 20) {
    const response = await api.get<ApiResponse<{ products: Product[]; total: number }>>(
      '/products',
      { params: { page, limit } }
    );
    return response.data.data;
  },

  async getProductById(id: string) {
    const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data.data;
  },

  async getProductsByCategory(categoryId: string, page: number = 1, limit: number = 20) {
    const response = await api.get<ApiResponse<{ products: Product[]; total: number }>>(
      `/products/category/${categoryId}`,
      { params: { page, limit } }
    );
    return response.data.data;
  },

  async searchProducts(query: string, page: number = 1, limit: number = 20) {
    const response = await api.get<ApiResponse<{ products: Product[]; total: number }>>(
      '/products/search',
      { params: { query, page, limit } }
    );
    return response.data.data;
  },

  async getCategories() {
    const response = await api.get<ApiResponse<Category[]>>('/categories');
    return response.data.data;
  },
};
