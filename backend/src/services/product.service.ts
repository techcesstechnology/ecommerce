import { v4 as uuidv4 } from 'uuid';
import {
  Product,
  CreateProductDto,
  UpdateProductDto,
  ProductFilters,
} from '../models/product.model';

// Define PaginatedResponse locally since shared package may not be built
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

// In-memory storage for products (replace with database in production)
const productsStore = new Map<string, Product>();

export class ProductService {
  /**
   * Get all products with optional filters and pagination
   */
  async getProducts(filters: ProductFilters): Promise<PaginatedResponse<Product>> {
    let products = Array.from(productsStore.values());

    // Apply filters
    if (filters.category) {
      products = products.filter((p) => p.category === filters.category);
    }

    if (filters.status) {
      products = products.filter((p) => p.status === filters.status);
    }

    if (filters.minPrice !== undefined) {
      products = products.filter((p) => p.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      products = products.filter((p) => p.price <= filters.maxPrice!);
    }

    if (filters.tags && filters.tags.length > 0) {
      products = products.filter((p) => filters.tags!.some((tag) => p.tags.includes(tag)));
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.sku.toLowerCase().includes(searchLower)
      );
    }

    // Sorting
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';

    products.sort((a, b) => {
      const aValue = a[sortBy as keyof Product];
      const bValue = b[sortBy as keyof Product];

      if (aValue !== undefined && bValue !== undefined) {
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedProducts = products.slice(startIndex, endIndex);
    const total = products.length;
    const totalPages = Math.ceil(total / limit);

    return {
      items: paginatedProducts,
      total,
      page,
      perPage: limit,
      totalPages,
    };
  }

  /**
   * Get a product by ID
   */
  async getProductById(id: string): Promise<Product | null> {
    return productsStore.get(id) || null;
  }

  /**
   * Get a product by SKU
   */
  async getProductBySku(sku: string): Promise<Product | null> {
    const products = Array.from(productsStore.values());
    return products.find((p) => p.sku === sku) || null;
  }

  /**
   * Create a new product
   */
  async createProduct(data: CreateProductDto): Promise<Product> {
    // Check if SKU already exists
    const existingProduct = await this.getProductBySku(data.sku);
    if (existingProduct) {
      throw new Error('Product with this SKU already exists');
    }

    const now = new Date();
    const product: Product = {
      id: uuidv4(),
      name: data.name,
      description: data.description,
      price: data.price,
      comparePrice: data.comparePrice,
      images: data.images || [],
      category: data.category,
      tags: data.tags || [],
      stock: data.stock,
      sku: data.sku,
      status: data.status || 'draft',
      features: data.features || [],
      specifications: data.specifications || {},
      createdAt: now,
      updatedAt: now,
    };

    productsStore.set(product.id, product);
    return product;
  }

  /**
   * Update a product
   */
  async updateProduct(id: string, data: UpdateProductDto): Promise<Product | null> {
    const product = productsStore.get(id);
    if (!product) {
      return null;
    }

    // Check if SKU is being updated and if it conflicts
    if (data.sku && data.sku !== product.sku) {
      const existingProduct = await this.getProductBySku(data.sku);
      if (existingProduct && existingProduct.id !== id) {
        throw new Error('Product with this SKU already exists');
      }
    }

    const updatedProduct: Product = {
      ...product,
      ...data,
      updatedAt: new Date(),
    };

    productsStore.set(id, updatedProduct);
    return updatedProduct;
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: string): Promise<boolean> {
    return productsStore.delete(id);
  }

  /**
   * Update product stock
   */
  async updateStock(id: string, quantity: number): Promise<Product | null> {
    const product = productsStore.get(id);
    if (!product) {
      return null;
    }

    const updatedProduct: Product = {
      ...product,
      stock: quantity,
      updatedAt: new Date(),
    };

    productsStore.set(id, updatedProduct);
    return updatedProduct;
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(category: string): Promise<Product[]> {
    const products = Array.from(productsStore.values());
    return products.filter((p) => p.category === category);
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(threshold: number = 10): Promise<Product[]> {
    const products = Array.from(productsStore.values());
    return products.filter((p) => p.stock <= threshold);
  }
}

export const productService = new ProductService();
