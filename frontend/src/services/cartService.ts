import { api } from './api';
import { Cart, ApiResponse } from '../types';

export const cartService = {
  async getCart() {
    const response = await api.get<ApiResponse<Cart>>('/cart');
    return response.data.data;
  },

  async addToCart(productId: string, quantity: number = 1) {
    const response = await api.post<ApiResponse<Cart>>('/cart/items', {
      productId,
      quantity,
    });
    return response.data.data;
  },

  async updateCartItem(productId: string, quantity: number) {
    const response = await api.put<ApiResponse<Cart>>(`/cart/items/${productId}`, {
      quantity,
    });
    return response.data.data;
  },

  async removeFromCart(productId: string) {
    const response = await api.delete<ApiResponse<Cart>>(`/cart/items/${productId}`);
    return response.data.data;
  },

  async applyPromoCode(code: string) {
    const response = await api.post<ApiResponse<Cart>>('/cart/promo', {
      code,
    });
    return response.data.data;
  },

  async removePromoCode() {
    const response = await api.delete<ApiResponse<Cart>>('/cart/promo');
    return response.data.data;
  },

  async clearCart() {
    const response = await api.delete<ApiResponse<void>>('/cart');
    return response.data;
  },
};
