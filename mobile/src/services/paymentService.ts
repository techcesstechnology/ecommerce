import { api, ApiResponse } from './api';

export interface PaymentTransaction {
  id: string;
  orderId: string;
  amount: number;
  status: string;
  paymentMethod: string;
  reference?: string;
  phoneNumber?: string;
  createdAt: string;
}

export const paymentService = {
  async initiatePayment(
    orderId: string,
    paymentMethod: string,
    phoneNumber?: string
  ) {
    const response = await api.post<ApiResponse<PaymentTransaction>>(
      '/payments/initiate',
      {
        orderId,
        paymentMethod,
        phoneNumber,
      }
    );
    return response.data.data;
  },

  async checkPaymentStatus(reference: string) {
    const response = await api.get<ApiResponse<PaymentTransaction>>(
      `/payments/status/${reference}`
    );
    return response.data.data;
  },

  async getOrderPayments(orderId: string) {
    const response = await api.get<ApiResponse<PaymentTransaction[]>>(
      `/payments/order/${orderId}`
    );
    return response.data.data;
  },
};
