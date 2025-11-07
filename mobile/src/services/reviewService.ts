import { api, ApiResponse } from './api';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  comment?: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

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

  async createReview(data: CreateReviewData) {
    const response = await api.post<ApiResponse<Review>>('/reviews', data);
    return response.data.data;
  },

  async getUserReviews() {
    const response = await api.get<ApiResponse<Review[]>>('/reviews/user');
    return response.data.data;
  },

  async deleteReview(id: string) {
    await api.delete(`/reviews/${id}`);
  },
};
