/**
 * Product Test Factory
 * Factory functions for creating test product data
 */

import { Product } from '../../models/product.entity';
import { randomString } from '../utils/test-helpers';

export interface ProductFactoryOptions {
  name?: string;
  description?: string;
  price?: number;
  stockQuantity?: number;
  categoryId?: string;
  images?: string[];
  isActive?: boolean;
  featured?: boolean;
}

/**
 * Create product data without saving to database
 */
export function buildProduct(options: ProductFactoryOptions = {}): Partial<Product> {
  return {
    name: options.name || `Test Product ${randomString(5)}`,
    description: options.description || `Description for test product ${randomString(10)}`,
    price: options.price || Math.floor(Math.random() * 10000) / 100,
    stockQuantity: options.stockQuantity !== undefined ? options.stockQuantity : Math.floor(Math.random() * 100),
    categoryId: options.categoryId,
    images: options.images || [],
    isActive: options.isActive !== undefined ? options.isActive : true,
    isFeatured: options.featured || false,
  };
}

/**
 * Create featured product data
 */
export function buildFeaturedProduct(options: Omit<ProductFactoryOptions, 'featured'> = {}): Partial<Product> {
  return buildProduct({
    ...options,
    featured: true,
  });
}

/**
 * Create out of stock product data
 */
export function buildOutOfStockProduct(options: Omit<ProductFactoryOptions, 'stockQuantity'> = {}): Partial<Product> {
  return buildProduct({
    ...options,
    stockQuantity: 0,
  });
}
