import { api } from './api';
import { ApiResponse, PaginatedResponse } from '../types';

export interface Category {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  parentId: string | null;
  status: 'active' | 'inactive';
  displayOrder: number;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  parentId?: string;
  status?: 'active' | 'inactive';
  displayOrder?: number;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  parentId?: string;
  status?: 'active' | 'inactive';
  displayOrder?: number;
}

export const categoryService = {
  async getAllCategories() {
    const response = await api.get<ApiResponse<Category[]>>('/categories');
    return response.data.data;
  },

  async getCategoryById(id: string) {
    const response = await api.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data.data;
  },

  async getCategoryBySlug(slug: string) {
    const response = await api.get<ApiResponse<Category>>(`/categories/slug/${slug}`);
    return response.data.data;
  },

  async createCategory(data: CreateCategoryDto) {
    const response = await api.post<ApiResponse<Category>>('/categories', data);
    return response.data.data;
  },

  async updateCategory(id: string, data: UpdateCategoryDto) {
    const response = await api.put<ApiResponse<Category>>(`/categories/${id}`, data);
    return response.data.data;
  },

  async deleteCategory(id: string) {
    const response = await api.delete<ApiResponse<void>>(`/categories/${id}`);
    return response.data;
  },
};
