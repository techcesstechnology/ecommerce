// API Configuration
export const API_VERSION = 'v1';
export const API_TIMEOUT = 30000; // 30 seconds

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Zimbabwe Provinces
export const ZIMBABWE_PROVINCES = [
  'Harare',
  'Bulawayo',
  'Manicaland',
  'Mashonaland Central',
  'Mashonaland East',
  'Mashonaland West',
  'Masvingo',
  'Matabeleland North',
  'Matabeleland South',
  'Midlands',
] as const;

// Product Categories
export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home & Garden',
  'Sports & Outdoors',
  'Books',
  'Toys & Games',
  'Food & Beverages',
  'Health & Beauty',
  'Automotive',
  'Office Supplies',
] as const;

// Supported Currencies
export const SUPPORTED_CURRENCIES = ['USD', 'ZWL', 'ZAR'] as const;

// Order Status Colors (for UI)
export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: '#FFA500',
  CONFIRMED: '#4169E1',
  PROCESSING: '#1E90FF',
  SHIPPED: '#9370DB',
  DELIVERED: '#32CD32',
  CANCELLED: '#DC143C',
};

// App Configuration
export const APP_NAME = 'FreshRoute';
export const APP_DESCRIPTION = "Zimbabwe's Premier E-commerce Platform";
export const SUPPORT_EMAIL = 'support@freshroute.co.zw';
export const SUPPORT_PHONE = '+263 XX XXX XXXX';
