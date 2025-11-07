import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database.config';
import { Product } from '../models/product.entity';
import { Category } from '../models/category.entity';

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
  categoryId: number;
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
  categoryId?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  metadata?: Record<string, unknown>;
}

export interface ProductFilters {
  categoryId?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  onSale?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest' | 'rating';
  page?: number;
  limit?: number;
}

export class ProductService {
  private productRepository: Repository<Product>;
  private categoryRepository: Repository<Category>;

  constructor() {
    this.productRepository = AppDataSource.getRepository(Product);
    this.categoryRepository = AppDataSource.getRepository(Category);
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
  async getProductById(id: string | number): Promise<Product | null> {
    try {
      return await this.productRepository.findOne({
        where: { id: Number(id) },
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

      if (filters.onSale) {
        query.andWhere('product.salePrice IS NOT NULL');
      }

      // Pagination
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;

      query.skip(skip).take(limit);

      // Sorting
      const sortBy = filters.sortBy || 'newest';
      switch (sortBy) {
        case 'price_asc':
          query.orderBy('product.price', 'ASC');
          break;
        case 'price_desc':
          query.orderBy('product.price', 'DESC');
          break;
        case 'name_asc':
          query.orderBy('product.name', 'ASC');
          break;
        case 'name_desc':
          query.orderBy('product.name', 'DESC');
          break;
        case 'rating':
          query.orderBy('product.averageRating', 'DESC');
          query.addOrderBy('product.reviewCount', 'DESC');
          break;
        case 'newest':
        default:
          query.orderBy('product.createdAt', 'DESC');
          break;
      }

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
  async updateProduct(id: string | number, data: UpdateProductDto): Promise<Product | null> {
    try {
      const product = await this.productRepository.findOne({ where: { id: Number(id) } });
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
  async deleteProduct(id: string | number): Promise<boolean> {
    try {
      const result = await this.productRepository.update(Number(id), { isActive: false });
      return result.affected !== undefined && result.affected > 0;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  }

  /**
   * Update product stock
   */
  async updateStock(id: string | number, quantity: number): Promise<Product | null> {
    try {
      const product = await this.productRepository.findOne({ where: { id: Number(id) } });
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

  async getFeaturedProducts(limit: number = 10): Promise<Product[]> {
    try {
      return await this.productRepository.find({
        where: { isActive: true, isFeatured: true },
        relations: ['category'],
        order: { createdAt: 'DESC' },
        take: limit,
      });
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw new Error('Failed to fetch featured products');
    }
  }

  async getOnSaleProducts(page: number = 1, limit: number = 20): Promise<{ products: Product[]; total: number }> {
    return this.getProducts({ onSale: true, page, limit });
  }

  async getRelatedProducts(productId: string | number, limit: number = 4): Promise<Product[] | null> {
    try {
      const product = await this.productRepository.findOne({
        where: { id: Number(productId) },
        relations: ['category'],
      });

      if (!product) {
        return null;
      }

      const relatedProducts = await this.productRepository.find({
        where: {
          categoryId: product.categoryId,
          isActive: true,
        },
        order: { createdAt: 'DESC' },
        take: limit + 1,
      });

      return relatedProducts.filter((p) => p.id !== Number(productId)).slice(0, limit);
    } catch (error) {
      console.error('Error fetching related products:', error);
      throw new Error('Failed to fetch related products');
    }
  }

  async getCategories(): Promise<Category[]> {
    try {
      return await this.categoryRepository.find({
        where: { isActive: true },
        order: { sortOrder: 'ASC', name: 'ASC' },
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  async getCategoryById(id: string): Promise<Category | null> {
    try {
      const idNum = Number(id);
      if (!Number.isInteger(idNum) || idNum <= 0) {
        throw new Error('Invalid category ID');
      }

      return await this.categoryRepository.findOne({
        where: { id: idNum, isActive: true },
      });
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      return await this.categoryRepository.findOne({
        where: { slug, isActive: true },
      });
    } catch (error) {
      console.error('Error fetching category by slug:', error);
      throw new Error('Failed to fetch category by slug');
    }
  }
}

export const productService = new ProductService();
