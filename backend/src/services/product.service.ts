import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database.config';
import { Product } from '../models/product.entity';

export interface CreateProductDto {
  name: string;
  sku: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity?: number;
  lowStockThreshold?: number;
  unit?: string;
  imageUrl?: string;
  images?: string[];
  categoryId: string;
  isActive?: boolean;
  isFeatured?: boolean;
  metadata?: Record<string, unknown>;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  compareAtPrice?: number;
  stockQuantity?: number;
  lowStockThreshold?: number;
  unit?: string;
  imageUrl?: string;
  images?: string[];
  categoryId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  metadata?: Record<string, unknown>;
}

export interface ProductFilters {
  categoryId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  limit?: number;
}

export class ProductService {
  private productRepository: Repository<Product>;

  constructor() {
    this.productRepository = AppDataSource.getRepository(Product);
  }

  /**
   * Create a new product
   */
  async createProduct(data: CreateProductDto): Promise<Product> {
    try {
      const product = this.productRepository.create(data);
      return await this.productRepository.save(product);
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('Failed to create product');
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string): Promise<Product | null> {
    try {
      return await this.productRepository.findOne({
        where: { id },
        relations: ['category'],
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      throw new Error('Failed to fetch product');
    }
  }

  /**
   * Get product by SKU
   */
  async getProductBySku(sku: string): Promise<Product | null> {
    try {
      return await this.productRepository.findOne({
        where: { sku },
        relations: ['category'],
      });
    } catch (error) {
      console.error('Error fetching product by SKU:', error);
      throw new Error('Failed to fetch product by SKU');
    }
  }

  /**
   * Get products with filters and pagination
   */
  async getProducts(filters: ProductFilters): Promise<{ products: Product[]; total: number }> {
    try {
      const query = this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.category', 'category');

      if (filters.categoryId) {
        query.andWhere('product.categoryId = :categoryId', { categoryId: filters.categoryId });
      }

      if (filters.isActive !== undefined) {
        query.andWhere('product.isActive = :isActive', { isActive: filters.isActive });
      }

      if (filters.isFeatured !== undefined) {
        query.andWhere('product.isFeatured = :isFeatured', { isFeatured: filters.isFeatured });
      }

      if (filters.search) {
        query.andWhere(
          '(product.name ILIKE :search OR product.description ILIKE :search OR product.sku ILIKE :search)',
          { search: `%${filters.search}%` }
        );
      }

      if (filters.minPrice !== undefined) {
        query.andWhere('product.price >= :minPrice', { minPrice: filters.minPrice });
      }

      if (filters.maxPrice !== undefined) {
        query.andWhere('product.price <= :maxPrice', { maxPrice: filters.maxPrice });
      }

      if (filters.inStock) {
        query.andWhere('product.stockQuantity > 0');
      }

      // Pagination
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;

      query.skip(skip).take(limit);

      // Order by featured first, then by created date
      query.orderBy('product.isFeatured', 'DESC').addOrderBy('product.createdAt', 'DESC');

      const [products, total] = await query.getManyAndCount();

      return { products, total };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  }

  /**
   * Update a product
   */
  async updateProduct(id: string, data: UpdateProductDto): Promise<Product | null> {
    try {
      const product = await this.productRepository.findOne({ where: { id } });
      if (!product) {
        return null;
      }

      Object.assign(product, data);
      return await this.productRepository.save(product);
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }
  }

  /**
   * Delete a product (soft delete by setting isActive to false)
   */
  async deleteProduct(id: string): Promise<boolean> {
    try {
      const result = await this.productRepository.update(id, { isActive: false });
      return result.affected !== undefined && result.affected > 0;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  }

  /**
   * Update product stock
   */
  async updateStock(id: string, quantity: number): Promise<Product | null> {
    try {
      const product = await this.productRepository.findOne({ where: { id } });
      if (!product) {
        return null;
      }

      product.stockQuantity = quantity;
      return await this.productRepository.save(product);
    } catch (error) {
      console.error('Error updating product stock:', error);
      throw new Error('Failed to update product stock');
    }
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(): Promise<Product[]> {
    try {
      return await this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.category', 'category')
        .where('product.stockQuantity <= product.lowStockThreshold')
        .andWhere('product.isActive = true')
        .orderBy('product.stockQuantity', 'ASC')
        .getMany();
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      throw new Error('Failed to fetch low stock products');
    }
  }
}

export const productService = new ProductService();
