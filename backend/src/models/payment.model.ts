export type PaymentProvider = 'stripe' | 'paypal' | 'ecocash' | 'onemoney';

export interface PaymentTransaction {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  providerTransactionId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  failureReason?: string;
}

export interface ProcessPaymentDto {
  orderId: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  paymentMethod: string;
  paymentDetails: Record<string, unknown>;
}

export interface PaymentRefundDto {
  transactionId: string;
  amount?: number;
  reason: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  providerTransactionId?: string;
  status: string;
  message?: string;
}
