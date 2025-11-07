import { api, ApiResponse } from './api';

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
    stock: number;
  };
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  promoCode?: string;
}

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

  async updateCartItem(itemId: string, quantity: number) {
    const response = await api.put<ApiResponse<Cart>>(`/cart/items/${itemId}`, {
      quantity,
    });
    return response.data.data;
  },

  async removeFromCart(itemId: string) {
    await api.delete(`/cart/items/${itemId}`);
  },

  async clearCart() {
    await api.delete('/cart');
  },

  async applyPromoCode(code: string) {
    const response = await api.post<ApiResponse<Cart>>('/cart/promo-code', {
      code,
    });
    return response.data.data;
  },
};
