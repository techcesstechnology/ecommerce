import { api } from './api';

export interface InitiatePaymentData {
  orderId: number;
  paymentMethod: string;
  customerPhone?: string;
  customerEmail?: string;
  currency?: string;
}

export interface PaymentResponse {
  transactionId: number;
  transactionReference: string;
  status: string;
  pollUrl?: string;
  redirectUrl?: string;
  message: string;
}

export interface PaymentStatus {
  transactionId: number;
  orderId: number;
  transactionReference: string;
  status: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  customerPhone?: string;
  paidAt?: string;
  errorMessage?: string;
}

const paymentService = {
  async initiatePayment(data: InitiatePaymentData): Promise<PaymentResponse> {
    const response = await api.post<{ success: boolean; data: PaymentResponse; message: string }>(
      '/payments/initiate',
      data
    );
    return response.data.data;
  },

  async checkPaymentStatus(transactionReference: string): Promise<PaymentStatus> {
    const response = await api.get<{ success: boolean; data: PaymentStatus }>(
      `/payments/status/${transactionReference}`
    );
    return response.data.data;
  },

  async getPaymentDetails(id: number): Promise<any> {
    const response = await api.get<{ success: boolean; data: any }>(`/payments/${id}`);
    return response.data.data;
  },

  async getPaymentsByOrderId(orderId: number): Promise<PaymentStatus[]> {
    const response = await api.get<{ success: boolean; data: PaymentStatus[] }>(
      `/payments/order/${orderId}`
    );
    return response.data.data;
  },
};

export default paymentService;
