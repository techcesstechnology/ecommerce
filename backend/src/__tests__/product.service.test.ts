import { ProductService } from '../services/product.service';
import { CreateProductDto, UpdateProductDto } from '../models/product.model';

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(() => {
    service = new ProductService();
  });

  describe('createProduct', () => {
    it('should create a new product', async () => {
      const productData: CreateProductDto = {
        name: 'Test Product',
        description: 'This is a test product description',
        price: 99.99,
        category: 'test-category',
        stock: 100,
        sku: 'TEST-001',
      };

      const product = await service.createProduct(productData);

      expect(product).toBeDefined();
      expect(product.id).toBeDefined();
      expect(product.name).toBe(productData.name);
      expect(product.price).toBe(productData.price);
      expect(product.sku).toBe(productData.sku);
      expect(product.status).toBe('draft');
      expect(product.createdAt).toBeInstanceOf(Date);
      expect(product.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw error if SKU already exists', async () => {
      const productData: CreateProductDto = {
        name: 'Test Product',
        description: 'This is a test product description',
        price: 99.99,
        category: 'test-category',
        stock: 100,
        sku: 'DUPLICATE-SKU',
      };

      await service.createProduct(productData);

      await expect(service.createProduct(productData)).rejects.toThrow(
        'Product with this SKU already exists'
      );
    });
  });

  describe('getProductById', () => {
    it('should return a product by ID', async () => {
      const productData: CreateProductDto = {
        name: 'Test Product',
        description: 'This is a test product description',
        price: 99.99,
        category: 'test-category',
        stock: 100,
        sku: 'TEST-002',
      };

      const createdProduct = await service.createProduct(productData);
      const foundProduct = await service.getProductById(createdProduct.id);

      expect(foundProduct).toBeDefined();
      expect(foundProduct?.id).toBe(createdProduct.id);
      expect(foundProduct?.name).toBe(productData.name);
    });

    it('should return null for non-existent product', async () => {
      const product = await service.getProductById('non-existent-id');
      expect(product).toBeNull();
    });
  });

  describe('updateProduct', () => {
    it('should update a product', async () => {
      const productData: CreateProductDto = {
        name: 'Test Product',
        description: 'This is a test product description',
        price: 99.99,
        category: 'test-category',
        stock: 100,
        sku: 'TEST-003',
      };

      const product = await service.createProduct(productData);

      const updateData: UpdateProductDto = {
        name: 'Updated Product Name',
        price: 149.99,
      };

      const updatedProduct = await service.updateProduct(product.id, updateData);

      expect(updatedProduct).toBeDefined();
      expect(updatedProduct?.name).toBe(updateData.name);
      expect(updatedProduct?.price).toBe(updateData.price);
      expect(updatedProduct?.sku).toBe(productData.sku);
    });

    it('should return null when updating non-existent product', async () => {
      const updateData: UpdateProductDto = {
        name: 'Updated Product Name',
      };

      const result = await service.updateProduct('non-existent-id', updateData);
      expect(result).toBeNull();
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product', async () => {
      const productData: CreateProductDto = {
        name: 'Test Product',
        description: 'This is a test product description',
        price: 99.99,
        category: 'test-category',
        stock: 100,
        sku: 'TEST-004',
      };

      const product = await service.createProduct(productData);
      const deleted = await service.deleteProduct(product.id);

      expect(deleted).toBe(true);

      const foundProduct = await service.getProductById(product.id);
      expect(foundProduct).toBeNull();
    });

    it('should return false when deleting non-existent product', async () => {
      const result = await service.deleteProduct('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('getProducts', () => {
    it('should return paginated products', async () => {
      const product1: CreateProductDto = {
        name: 'Product 1',
        description: 'Description 1',
        price: 10,
        category: 'category-1',
        stock: 10,
        sku: 'SKU-001',
        status: 'published',
      };

      const product2: CreateProductDto = {
        name: 'Product 2',
        description: 'Description 2',
        price: 20,
        category: 'category-1',
        stock: 20,
        sku: 'SKU-002',
        status: 'published',
      };

      await service.createProduct(product1);
      await service.createProduct(product2);

      const result = await service.getProducts({ page: 1, limit: 10 });

      expect(result).toBeDefined();
      expect(result.items.length).toBeGreaterThanOrEqual(2);
      expect(result.total).toBeGreaterThanOrEqual(2);
      expect(result.page).toBe(1);
      expect(result.perPage).toBe(10);
    });

    it('should filter products by category', async () => {
      const product: CreateProductDto = {
        name: 'Filtered Product',
        description: 'Description',
        price: 10,
        category: 'unique-category',
        stock: 10,
        sku: 'SKU-FILTER-001',
        status: 'published',
      };

      await service.createProduct(product);

      const result = await service.getProducts({ category: 'unique-category' });

      expect(result.items.length).toBeGreaterThanOrEqual(1);
      expect(result.items[0].category).toBe('unique-category');
    });
  });
});
