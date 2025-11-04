export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
  discount?: number;
  subtotal: number;
}

export interface Cart {
  id: string;
  userId?: string;
  sessionId: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  discountCode?: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

export interface AddToCartDto {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}

export interface ApplyDiscountDto {
  code: string;
}

export interface SavedItem {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  productImage?: string;
  price: number;
  savedAt: Date;
}

export interface ShareCartDto {
  email: string;
  message?: string;
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
}
