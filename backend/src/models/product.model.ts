export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  category: string;
  tags: string[];
  stock: number;
  sku: string;
  status: 'draft' | 'published' | 'archived';
  features: string[];
  specifications: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  images?: string[];
  category: string;
  tags?: string[];
  stock: number;
  sku: string;
  status?: 'draft' | 'published' | 'archived';
  features?: string[];
  specifications?: Record<string, string>;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  comparePrice?: number;
  images?: string[];
  category?: string;
  tags?: string[];
  stock?: number;
  sku?: string;
  status?: 'draft' | 'published' | 'archived';
  features?: string[];
  specifications?: Record<string, string>;
}

export interface ProductFilters {
  category?: string;
  status?: 'draft' | 'published' | 'archived';
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
