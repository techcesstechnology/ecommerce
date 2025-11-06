import { api } from './api';
import { WishlistItem, ApiResponse } from '../types';

export const wishlistService = {
  async getWishlist() {
    const response = await api.get<ApiResponse<{ items: WishlistItem[] }>>('/wishlist');
    return response.data.data.items;
  },

  async addToWishlist(productId: string, notes?: string) {
    const response = await api.post<ApiResponse<WishlistItem>>('/wishlist', {
      productId,
      notes,
    });
    return response.data.data;
  },

  async removeFromWishlist(productId: string) {
    await api.delete(`/wishlist/${productId}`);
  },

  async updateWishlistItem(productId: string, notes: string) {
    const response = await api.put<ApiResponse<WishlistItem>>(`/wishlist/${productId}`, {
      notes,
    });
    return response.data.data;
  },

  async isInWishlist(productId: string) {
    try {
      const response = await api.get<ApiResponse<{ inWishlist: boolean }>>(
        `/wishlist/check/${productId}`
      );
      return response.data.data.inWishlist;
    } catch {
      return false;
    }
  },

  async clearWishlist() {
    await api.delete('/wishlist');
  },
};
