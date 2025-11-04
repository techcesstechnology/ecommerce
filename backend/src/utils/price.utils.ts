/**
 * Calculate item subtotal with discount
 */
export const calculateItemSubtotal = (
  price: number,
  quantity: number,
  discount: number = 0
): number => {
  const subtotal = price * quantity;
  const discountAmount = (subtotal * discount) / 100;
  return Math.round((subtotal - discountAmount) * 100) / 100;
};

/**
 * Calculate tax amount
 */
export const calculateTax = (subtotal: number, taxRate: number = 15): number => {
  return Math.round(subtotal * (taxRate / 100) * 100) / 100;
};

/**
 * Calculate shipping cost based on subtotal
 */
export const calculateShipping = (subtotal: number, shippingRate: number = 5): number => {
  // Free shipping for orders over $100
  if (subtotal >= 100) {
    return 0;
  }
  return Math.round(shippingRate * 100) / 100;
};

/**
 * Calculate total with all fees
 */
export const calculateTotal = (
  subtotal: number,
  discount: number,
  tax: number,
  shipping: number
): number => {
  const total = subtotal - discount + tax + shipping;
  return Math.round(total * 100) / 100;
};

/**
 * Validate discount code
 */
export const validateDiscountCode = (
  code: string,
  subtotal: number
): { valid: boolean; discount: number; message?: string } => {
  // Mock discount codes for development
  const discountCodes: Record<string, { type: 'percentage' | 'fixed'; value: number }> = {
    SAVE10: { type: 'percentage', value: 10 },
    SAVE20: { type: 'percentage', value: 20 },
    FLAT5: { type: 'fixed', value: 5 },
    FLAT10: { type: 'fixed', value: 10 },
  };

  const discountConfig = discountCodes[code.toUpperCase()];

  if (!discountConfig) {
    return { valid: false, discount: 0, message: 'Invalid discount code' };
  }

  let discount = 0;
  if (discountConfig.type === 'percentage') {
    discount = Math.round(subtotal * (discountConfig.value / 100) * 100) / 100;
  } else {
    discount = discountConfig.value;
  }

  return { valid: true, discount, message: 'Discount applied successfully' };
};

/**
 * Format currency
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Convert currency (simplified mock implementation)
 */
export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number => {
  // Mock conversion rates
  const rates: Record<string, number> = {
    USD: 1,
    ZWL: 322, // Zimbabwe Dollar
    ZAR: 18.5, // South African Rand
    EUR: 0.92,
    GBP: 0.79,
  };

  const fromRate = rates[fromCurrency] || 1;
  const toRate = rates[toCurrency] || 1;

  const usdAmount = amount / fromRate;
  return Math.round(usdAmount * toRate * 100) / 100;
};
