export type PaymentProvider = 'pesepay' | 'paynow' | 'stripe' | 'mock';

export type PaymentMethod = 'ecocash' | 'visa' | 'onemoney' | 'cash' | 'card';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export type Currency = 'ZWL' | 'USD';

// Pesepay Payment Method Codes
export const PESEPAY_PAYMENT_METHODS = {
  ECOCASH: 'PZW201',
  VISA: 'PZW203',
  ONEMONEY: 'PZW202',
} as const;

export interface CreatePaymentDto {
  orderId: number;
  userId: number;
  amount: number;
  currency: Currency;
  paymentMethod: PaymentMethod;
  customerPhone?: string;
  customerEmail?: string;
  description?: string;
}

export interface PesepayConfig {
  integrationKey: string;
  encryptionKey: string;
  resultUrl: string;
  returnUrl: string;
  environment: 'sandbox' | 'production';
}

export interface PesepayTransactionRequest {
  amount: number;
  currencyCode: Currency;
  transactionDescription: string;
  transactionReference: string;
  customerPhone?: string;
  customerEmail?: string;
  paymentMethodCode: string;
}

export interface PesepayTransactionResponse {
  success: boolean;
  pollUrl?: string;
  redirectUrl?: string;
  transactionReference?: string;
  message?: string;
  error?: string;
}

export interface PesepayStatusResponse {
  paid: boolean;
  amount?: number;
  transactionReference?: string;
  paymentMethod?: string;
  message?: string;
  error?: string;
}

export interface PaymentWebhookData {
  transactionReference: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod: string;
  provider: PaymentProvider;
  metadata?: Record<string, any>;
}

export interface InitiatePaymentResponse {
  transactionId: number;
  transactionReference: string;
  pollUrl?: string;
  redirectUrl?: string;
  status: PaymentStatus;
  message: string;
}
