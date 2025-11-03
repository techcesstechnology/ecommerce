// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  VENDOR = 'VENDOR',
  ADMIN = 'ADMIN',
}

// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: Currency;
  category: string;
  images: string[];
  stock: number;
  vendorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum Currency {
  USD = 'USD',
  ZWL = 'ZWL',
  ZAR = 'ZAR',
}

// Order types
export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  currency: Currency;
  status: OrderStatus;
  shippingAddress: Address;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

// Address types
export interface Address {
  street: string;
  city: string;
  province: string;
  postalCode?: string;
  country: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
