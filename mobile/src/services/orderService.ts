import { api, ApiResponse } from './api';

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      imageUrl?: string;
    };
  }>;
}

export interface CreateOrderData {
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  deliverySlotId?: string;
  paymentMethod: 'ecocash' | 'card' | 'cash';
  ecocashPhone?: string;
}

export const orderService = {
  async createOrder(data: CreateOrderData) {
    const response = await api.post<ApiResponse<Order>>('/orders', data);
    return response.data.data;
  },

  async getOrders() {
    const response = await api.get<ApiResponse<Order[]>>('/orders');
    return response.data.data;
  },

  async getOrderById(id: string) {
    const response = await api.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data.data;
  },
};
