import { api } from './api';
import { Review, RatingSummary, ApiResponse } from '../types';

export interface CreateReviewData {
  productId: string;
  rating: number;
  title?: string;
  comment?: string;
}

export const reviewService = {
  async getProductReviews(productId: string, page: number = 1, limit: number = 10) {
    const response = await api.get<ApiResponse<{ reviews: Review[]; total: number }>>(
      `/reviews/product/${productId}`,
      {
        params: { page, limit },
      }
    );
    return response.data.data;
  },

  async getProductRatingSummary(productId: string) {
    const response = await api.get<ApiResponse<RatingSummary>>(
      `/reviews/${productId}/summary`
    );
    return response.data.data;
  },

  async createReview(data: CreateReviewData) {
    const response = await api.post<ApiResponse<Review>>('/reviews', data);
    return response.data.data;
  },

  async updateReview(id: string, data: Partial<CreateReviewData>) {
    const response = await api.put<ApiResponse<Review>>(`/reviews/${id}`, data);
    return response.data.data;
  },

  async deleteReview(id: string) {
    await api.delete(`/reviews/${id}`);
  },

  async markReviewHelpful(id: string) {
    const response = await api.put<ApiResponse<Review>>(`/reviews/${id}/helpful`);
    return response.data.data;
  },
};
