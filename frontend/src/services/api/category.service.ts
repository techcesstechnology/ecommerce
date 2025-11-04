import api from '../api';
import { Category, ApiResponse } from '../../types';

export const categoryService = {
  // Get all categories
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    return api.get('/categories');
  },

  // Get category by ID
  getCategory: async (id: string): Promise<ApiResponse<Category>> => {
    return api.get(`/categories/${id}`);
  },

  // Create category
  createCategory: async (data: {
    name: string;
    slug?: string;
    description?: string;
    parentId?: string;
    image?: string;
    status?: 'active' | 'inactive';
  }): Promise<ApiResponse<Category>> => {
    return api.post('/categories', data, {
      headers: { 'x-admin-role': 'admin' },
    });
  },

  // Update category
  updateCategory: async (
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      parentId?: string;
      image?: string;
      status?: 'active' | 'inactive';
    }
  ): Promise<ApiResponse<Category>> => {
    return api.put(`/categories/${id}`, data, {
      headers: { 'x-admin-role': 'admin' },
    });
  },

  // Delete category
  deleteCategory: async (id: string): Promise<ApiResponse<null>> => {
    return api.delete(`/categories/${id}`, {
      headers: { 'x-admin-role': 'admin' },
    });
  },
};
