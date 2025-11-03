import { createClient, RedisClientType } from 'redis';
import { ProductModel } from '../models/product.model';
import { CategoryModel } from '../models/category.model';
import {
  CreateProductDTO,
  UpdateProductDTO,
  CreateCategoryDTO,
  Product,
  ProductCategory,
  ProductFilter,
  PaginatedResponse,
  PaginationOptions,
  ProductStatus
} from '../types/product.types';

export class ProductService {
  private redisClient: RedisClientType | null = null;
  private cacheEnabled = false;
  private cacheTTL = 300; // 5 minutes
  private redisInitialized = false;
  private redisInitPromise: Promise<void> | null = null;

  constructor() {
    this.redisInitPromise = this.initializeRedis();
  }

  /**
   * Ensure Redis is initialized before using it
   */
  private async ensureRedisInitialized(): Promise<void> {
    if (this.redisInitialized) return;
    if (this.redisInitPromise) {
      await this.redisInitPromise;
    }
  }

  /**
   * Initialize Redis connection
   */
  private async initializeRedis(): Promise<void> {
    // Skip Redis initialization in test environment
    if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID) {
      console.log('Skipping Redis initialization in test environment');
      this.cacheEnabled = false;
      this.redisInitialized = true;
      return;
    }

    try {
      this.redisClient = createClient({
        url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
        password: process.env.REDIS_PASSWORD || undefined
      });

      this.redisClient.on('error', (err) => {
        console.error('Redis Client Error:', err);
        this.cacheEnabled = false;
      });

      this.redisClient.on('connect', () => {
        console.log('Redis connected successfully');
        this.cacheEnabled = true;
      });

      await this.redisClient.connect();
      this.redisInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
      this.cacheEnabled = false;
      this.redisInitialized = true;
    }
  }

  /**
   * Get from cache
   */
  private async getFromCache<T>(key: string): Promise<T | null> {
    await this.ensureRedisInitialized();
    if (!this.cacheEnabled || !this.redisClient) return null;

    try {
      const cached = await this.redisClient.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set to cache
   */
  private async setToCache(key: string, value: any, ttl: number = this.cacheTTL): Promise<void> {
    await this.ensureRedisInitialized();
    if (!this.cacheEnabled || !this.redisClient) return;

    try {
      await this.redisClient.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Invalidate cache using SCAN for better performance
   */
  private async invalidateCache(pattern: string): Promise<void> {
    await this.ensureRedisInitialized();
    if (!this.cacheEnabled || !this.redisClient) return;

    try {
      // Use SCAN instead of KEYS for better performance
      let cursor = 0;
      const keysToDelete: string[] = [];

      do {
        const result = await this.redisClient.scan(cursor, {
          MATCH: pattern,
          COUNT: 100
        });
        
        cursor = result.cursor;
        keysToDelete.push(...result.keys);
      } while (cursor !== 0);

      if (keysToDelete.length > 0) {
        await this.redisClient.del(keysToDelete);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }

  /**
   * Create a new product
   */
  async createProduct(data: CreateProductDTO, userId?: string): Promise<Product> {
    const productData: any = {
      ...data,
      slug: this.generateSlug(data.name),
      createdBy: userId,
      updatedBy: userId,
      status: ProductStatus.ACTIVE
    };

    const product = new ProductModel(productData);
    await product.save();

    // Invalidate list caches
    await this.invalidateCache('products:list:*');
    await this.invalidateCache('products:search:*');

    return product.toObject() as Product;
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string): Promise<Product | null> {
    const cacheKey = `products:${id}`;
    
    // Try cache first
    const cached = await this.getFromCache<Product>(cacheKey);
    if (cached) return cached;

    const product = await ProductModel.findById(id).lean();
    
    if (product) {
      await this.setToCache(cacheKey, product);
    }

    return product as Product | null;
  }

  /**
   * Update product
   */
  async updateProduct(id: string, data: UpdateProductDTO, userId?: string): Promise<Product | null> {
    const updateData: any = {
      ...data,
      updatedBy: userId
    };

    if (data.name) {
      updateData.slug = this.generateSlug(data.name);
    }

    const product = await ProductModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (product) {
      // Invalidate caches
      await this.invalidateCache(`products:${id}`);
      await this.invalidateCache('products:list:*');
      await this.invalidateCache('products:search:*');
    }

    return product as Product | null;
  }

  /**
   * Archive product (soft delete)
   */
  async archiveProduct(id: string, userId?: string): Promise<boolean> {
    const result = await ProductModel.findByIdAndUpdate(
      id,
      { 
        status: ProductStatus.ARCHIVED,
        updatedBy: userId
      },
      { new: true }
    );

    if (result) {
      await this.invalidateCache(`products:${id}`);
      await this.invalidateCache('products:list:*');
      await this.invalidateCache('products:search:*');
    }

    return !!result;
  }

  /**
   * List products with filtering and pagination
   */
  async listProducts(
    filter: ProductFilter,
    pagination: PaginationOptions
  ): Promise<PaginatedResponse<Product>> {
    const cacheKey = `products:list:${JSON.stringify({ filter, pagination })}`;
    
    // Try cache first
    const cached = await this.getFromCache<PaginatedResponse<Product>>(cacheKey);
    if (cached) return cached;

    // Build query
    const query: any = {};

    if (filter.category) query.category = filter.category;
    if (filter.subcategory) query.subcategory = filter.subcategory;
    if (filter.supplier) query.supplier = filter.supplier;
    if (filter.status) query.status = filter.status;
    if (filter.tags && filter.tags.length > 0) {
      query.tags = { $in: filter.tags };
    }

    // Price filter
    if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
      const priceQuery: any = {};
      if (filter.minPrice !== undefined) priceQuery.$gte = filter.minPrice;
      if (filter.maxPrice !== undefined) priceQuery.$lte = filter.maxPrice;
      
      if (filter.currency) {
        query['prices'] = {
          $elemMatch: {
            currency: filter.currency,
            amount: priceQuery
          }
        };
      } else {
        query['prices.amount'] = priceQuery;
      }
    }

    // Text search
    if (filter.search) {
      query.$text = { $search: filter.search };
    }

    // Count total
    const total = await ProductModel.countDocuments(query);

    // Build sort
    const sort: any = {};
    if (filter.search) {
      sort.score = { $meta: 'textScore' };
    }

    // Fetch products
    const products = await ProductModel
      .find(query)
      .sort(sort)
      .skip((pagination.page - 1) * pagination.limit)
      .limit(pagination.limit)
      .lean();

    const response: PaginatedResponse<Product> = {
      data: products as unknown as Product[],
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit)
      }
    };

    // Cache response
    await this.setToCache(cacheKey, response, 120); // 2 minutes for lists

    return response;
  }

  /**
   * Search products (optimized with caching)
   */
  async searchProducts(
    searchTerm: string,
    pagination: PaginationOptions
  ): Promise<PaginatedResponse<Product>> {
    const cacheKey = `products:search:${searchTerm}:${pagination.page}:${pagination.limit}`;
    
    // Try cache first
    const cached = await this.getFromCache<PaginatedResponse<Product>>(cacheKey);
    if (cached) return cached;

    const query = {
      $text: { $search: searchTerm },
      status: ProductStatus.ACTIVE
    };

    const total = await ProductModel.countDocuments(query);

    const products = await ProductModel
      .find(query)
      .select({ score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .skip((pagination.page - 1) * pagination.limit)
      .limit(pagination.limit)
      .lean();

    const response: PaginatedResponse<Product> = {
      data: products as unknown as Product[],
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit)
      }
    };

    // Cache search results
    await this.setToCache(cacheKey, response, 300); // 5 minutes for searches

    return response;
  }

  /**
   * Create category
   */
  async createCategory(data: CreateCategoryDTO): Promise<ProductCategory> {
    const categoryData: any = {
      ...data,
      slug: this.generateSlug(data.name),
      isActive: true
    };

    const category = new CategoryModel(categoryData);
    await category.save();

    await this.invalidateCache('categories:*');

    return category.toObject() as ProductCategory;
  }

  /**
   * List categories
   */
  async listCategories(): Promise<ProductCategory[]> {
    const cacheKey = 'categories:list';
    
    const cached = await this.getFromCache<ProductCategory[]>(cacheKey);
    if (cached) return cached;

    const categories = await CategoryModel
      .find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .lean();

    await this.setToCache(cacheKey, categories, 600); // 10 minutes

    return categories as unknown as ProductCategory[];
  }

  /**
   * Get categories with subcategories
   */
  async getCategoriesWithSubcategories(): Promise<ProductCategory[]> {
    const cacheKey = 'categories:tree';
    
    const cached = await this.getFromCache<ProductCategory[]>(cacheKey);
    if (cached) return cached;

    const categories = await CategoryModel
      .find({ isActive: true, parentId: null })
      .populate('subcategories')
      .sort({ order: 1, name: 1 })
      .lean();

    await this.setToCache(cacheKey, categories, 600); // 10 minutes

    return categories as unknown as ProductCategory[];
  }

  /**
   * Generate slug from name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Close connections
   */
  async close(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }
}

export const productService = new ProductService();
