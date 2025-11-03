export enum Currency {
  USD = 'USD',
  ZWL = 'ZWL'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentMethod {
  STRIPE = 'STRIPE',
  ECOCASH = 'ECOCASH',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY'
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  currency: Currency;
  imageUrl?: string;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  total: number;
  currency: Currency;
  updatedAt: Date;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  currency: Currency;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingAddress: ShippingAddress;
  notes?: string;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: Currency;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  gatewayResponse?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentInitializeRequest {
  orderId: string;
  amount: number;
  currency: Currency;
  method: PaymentMethod;
  returnUrl?: string;
}

export interface PaymentInitializeResponse {
  paymentId: string;
  gatewayUrl?: string;
  reference?: string;
  instructions?: string;
}

export interface PaymentVerifyRequest {
  paymentId: string;
  reference?: string;
  transactionId?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
