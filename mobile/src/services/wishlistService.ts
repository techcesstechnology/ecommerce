import { api, ApiResponse } from './api';

export interface WishlistItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
    stock: number;
  };
}

export const wishlistService = {
  async getWishlist() {
    const response = await api.get<ApiResponse<WishlistItem[]>>('/wishlist');
    return response.data.data;
  },

  async addToWishlist(productId: string) {
    const response = await api.post<ApiResponse<WishlistItem>>('/wishlist', {
      productId,
    });
    return response.data.data;
  },

  async removeFromWishlist(itemId: string) {
    await api.delete(`/wishlist/${itemId}`);
  },

  async isInWishlist(productId: string) {
    const wishlist = await this.getWishlist();
    return wishlist.some(item => item.productId === productId);
  },
};
