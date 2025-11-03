export enum Currency {
  USD = 'USD',
  ZWL = 'ZWL'
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  OUT_OF_STOCK = 'OUT_OF_STOCK'
}

export interface ProductImage {
  url: string;
  thumbnailUrl: string;
  alt: string;
  order: number;
}

export interface ProductPrice {
  currency: Currency;
  amount: number;
}

export interface ProductVariant {
  _id?: string;
  name: string;
  attributes: Record<string, string>; // e.g., { size: 'L', color: 'red' }
  sku: string;
  price: ProductPrice[];
  stock: number;
  images?: ProductImage[];
}

export interface Product {
  _id?: string;
  name: string;
  description: string;
  slug: string;
  category: string;
  subcategory?: string;
  supplier?: string;
  prices: ProductPrice[];
  images: ProductImage[];
  variants?: ProductVariant[];
  stock: number;
  status: ProductStatus;
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface ProductCategory {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  image?: string;
  order?: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductFilter {
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  currency?: Currency;
  status?: ProductStatus;
  supplier?: string;
  tags?: string[];
  search?: string;
}

export interface ProductSort {
  field: 'price' | 'name' | 'createdAt' | 'updatedAt';
  order: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateProductDTO {
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  supplier?: string;
  prices: ProductPrice[];
  images?: ProductImage[];
  variants?: Omit<ProductVariant, '_id'>[];
  stock: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateProductDTO {
  name?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  supplier?: string;
  prices?: ProductPrice[];
  images?: ProductImage[];
  variants?: ProductVariant[];
  stock?: number;
  status?: ProductStatus;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface CreateCategoryDTO {
  name: string;
  description?: string;
  parentId?: string;
  image?: string;
  order?: number;
}
