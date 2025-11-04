export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

export type PaymentMethod = 'credit_card' | 'debit_card' | 'mobile_money' | 'cash_on_delivery';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
  discount?: number;
  subtotal: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode?: string;
  country: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  discountCode?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  createdAt: Date;
  updatedAt: Date;
  cancelledAt?: Date;
  deliveredAt?: Date;
}

export interface CreateOrderDto {
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  paymentMethod: PaymentMethod;
  discountCode?: string;
  notes?: string;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
  trackingNumber?: string;
  estimatedDelivery?: Date;
}

export interface OrderFilters {
  userId?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface RefundRequest {
  orderId: string;
  reason: string;
  amount?: number;
  items?: {
    orderItemId: string;
    quantity: number;
  }[];
}

export interface ReturnRequest {
  orderId: string;
  items: {
    orderItemId: string;
    quantity: number;
    reason: string;
  }[];
  notes?: string;
}
