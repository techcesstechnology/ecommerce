/**
 * Product Service Integration Tests
 * Tests database interactions for product service
 */

// Set up test environment variables
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_NAME = process.env.DB_NAME || 'test_db';
process.env.DB_USER = process.env.DB_USER || 'test_user';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'test_password';
process.env.JWT_SECRET = 'test_jwt_secret_at_least_32_characters_long_12345';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_at_least_32_characters_long_12345';
process.env.BACKEND_PORT = '5000';

import { ProductService } from '../../services/product.service';
import { initTestDatabase, cleanDatabase, closeTestDatabase } from '../utils/test-db';
import { buildProduct } from '../fixtures/product.factory';
import { randomString } from '../utils/test-helpers';

describe('ProductService Integration Tests', () => {
  let productService: ProductService;

  beforeAll(async () => {
    await initTestDatabase();
    productService = new ProductService();
  }, 30000);

  afterEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  }, 30000);

  describe('createProduct', () => {
    it('should create a new product', async () => {
      const productData = buildProduct({
        name: 'Test Product',
        price: 29.99,
      });

      const product = await productService.createProduct({
        name: productData.name!,
        sku: `SKU-${randomString(8)}`,
        description: productData.description,
        price: productData.price!,
        stockQuantity: productData.stockQuantity,
        categoryId: '550e8400-e29b-41d4-a716-446655440000', // Mock UUID
      });

      expect(product).toBeDefined();
      expect(product.id).toBeDefined();
      expect(product.name).toBe(productData.name);
      expect(product.price).toBe(productData.price);
    });

    it('should create featured product', async () => {
      const productData = buildProduct({ featured: true });

      const product = await productService.createProduct({
        name: productData.name!,
        sku: `SKU-${randomString(8)}`,
        price: productData.price!,
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
        isFeatured: true,
      });

      expect(product.isFeatured).toBe(true);
    });
  });

  describe('getProductById', () => {
    it('should fetch product by ID', async () => {
      const productData = buildProduct();
      const createdProduct = await productService.createProduct({
        name: productData.name!,
        sku: `SKU-${randomString(8)}`,
        price: productData.price!,
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
      });

      const product = await productService.getProductById(createdProduct.id);

      expect(product).toBeDefined();
      expect(product?.id).toBe(createdProduct.id);
      expect(product?.name).toBe(createdProduct.name);
    });

    it('should return null for non-existent product', async () => {
      const product = await productService.getProductById('non-existent-id');
      expect(product).toBeNull();
    });
  });

  describe('updateProduct', () => {
    it('should update product data', async () => {
      const productData = buildProduct();
      const createdProduct = await productService.createProduct({
        name: productData.name!,
        sku: `SKU-${randomString(8)}`,
        price: productData.price!,
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
      });

      const updatedProduct = await productService.updateProduct(createdProduct.id, {
        name: 'Updated Product Name',
        price: 49.99,
      });

      expect(updatedProduct).toBeDefined();
      expect(updatedProduct?.name).toBe('Updated Product Name');
      expect(updatedProduct?.price).toBe(49.99);
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product', async () => {
      const productData = buildProduct();
      const createdProduct = await productService.createProduct({
        name: productData.name!,
        sku: `SKU-${randomString(8)}`,
        price: productData.price!,
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
      });

      const result = await productService.deleteProduct(createdProduct.id);
      expect(result).toBe(true);

      const deletedProduct = await productService.getProductById(createdProduct.id);
      expect(deletedProduct).toBeNull();
    });

    it('should return false when deleting non-existent product', async () => {
      const result = await productService.deleteProduct('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('getProducts', () => {
    it('should get all products', async () => {
      // Create multiple products
      for (let i = 0; i < 3; i++) {
        const productData = buildProduct();
        await productService.createProduct({
          name: productData.name!,
          sku: `SKU-${randomString(8)}`,
          price: productData.price!,
          categoryId: '550e8400-e29b-41d4-a716-446655440000',
        });
      }

      const result = await productService.getProducts();

      expect(result.products.length).toBe(3);
      expect(result.total).toBe(3);
    });

    it('should filter products by featured status', async () => {
      // Create featured and non-featured products
      const featuredData = buildProduct({ featured: true });
      await productService.createProduct({
        name: featuredData.name!,
        sku: `SKU-${randomString(8)}`,
        price: featuredData.price!,
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
        isFeatured: true,
      });

      const regularData = buildProduct({ featured: false });
      await productService.createProduct({
        name: regularData.name!,
        sku: `SKU-${randomString(8)}`,
        price: regularData.price!,
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
        isFeatured: false,
      });

      const result = await productService.getProducts({ isFeatured: true });

      expect(result.products.length).toBe(1);
      expect(result.products[0].isFeatured).toBe(true);
    });

    it('should paginate products', async () => {
      // Create multiple products
      for (let i = 0; i < 5; i++) {
        const productData = buildProduct();
        await productService.createProduct({
          name: productData.name!,
          sku: `SKU-${randomString(8)}`,
          price: productData.price!,
          categoryId: '550e8400-e29b-41d4-a716-446655440000',
        });
      }

      const result = await productService.getProducts({ page: 1, limit: 2 });

      expect(result.products.length).toBe(2);
      expect(result.total).toBe(5);
    });
  });

  describe('updateStock', () => {
    it('should update product stock', async () => {
      const productData = buildProduct({ stockQuantity: 100 });
      const createdProduct = await productService.createProduct({
        name: productData.name!,
        sku: `SKU-${randomString(8)}`,
        price: productData.price!,
        stockQuantity: productData.stockQuantity,
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
      });

      const updatedProduct = await productService.updateStock(createdProduct.id, -10);

      expect(updatedProduct).toBeDefined();
      expect(updatedProduct?.stockQuantity).toBe(90);
    });
  });
});
