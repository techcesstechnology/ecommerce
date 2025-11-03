import request from 'supertest';
import App from '../app';
import { Currency, ProductStatus } from '../types/product.types';
import { productService } from '../services/product.service';

// Mock the product service
jest.mock('../services/product.service');
jest.mock('../middleware/auth.middleware', () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = { id: 'user123', email: 'test@example.com', role: 'ADMIN' };
    next();
  },
  authorize: (..._roles: string[]) => (_req: any, _res: any, next: any) => next()
}));

describe('Product Controller', () => {
  let app: App;
  let server: any;

  beforeAll(() => {
    app = new App();
    server = app.app;
  });

  afterAll(async () => {
    await app.stop();
  });

  describe('POST /api/products', () => {
    it('should create a product successfully', async () => {
      const mockProduct = {
        _id: '123',
        name: 'Test Product',
        description: 'Test description for the product',
        slug: 'test-product',
        category: 'Electronics',
        prices: [{ currency: Currency.USD, amount: 99.99 }],
        stock: 10,
        status: ProductStatus.ACTIVE,
        images: [],
        tags: []
      };

      (productService.createProduct as jest.Mock) = jest.fn().mockResolvedValue(mockProduct);

      const response = await request(server)
        .post('/api/products')
        .send({
          name: 'Test Product',
          description: 'Test description for the product',
          category: 'Electronics',
          prices: [{ currency: Currency.USD, amount: 99.99 }],
          stock: 10
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockProduct);
    });

    it('should return validation error for invalid data', async () => {
      const response = await request(server)
        .post('/api/products')
        .send({
          name: 'A', // Too short
          description: 'Short' // Too short
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation error');
    });
  });

  describe('GET /api/products/:id', () => {
    it('should get product by id', async () => {
      const mockProduct = {
        _id: '123',
        name: 'Test Product',
        description: 'Test description',
        category: 'Electronics',
        prices: [{ currency: Currency.USD, amount: 99.99 }],
        stock: 10,
        status: ProductStatus.ACTIVE
      };

      (productService.getProductById as jest.Mock) = jest.fn().mockResolvedValue(mockProduct);

      const response = await request(server).get('/api/products/507f1f77bcf86cd799439011');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockProduct);
    });

    it('should return 404 for non-existent product', async () => {
      (productService.getProductById as jest.Mock) = jest.fn().mockResolvedValue(null);

      const response = await request(server).get('/api/products/507f1f77bcf86cd799439011');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid product id', async () => {
      const response = await request(server).get('/api/products/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update product successfully', async () => {
      const mockProduct = {
        _id: '123',
        name: 'Updated Product',
        description: 'Updated description',
        category: 'Electronics',
        prices: [{ currency: Currency.USD, amount: 149.99 }],
        stock: 15,
        status: ProductStatus.ACTIVE
      };

      (productService.updateProduct as jest.Mock) = jest.fn().mockResolvedValue(mockProduct);

      const response = await request(server)
        .put('/api/products/507f1f77bcf86cd799439011')
        .send({
          name: 'Updated Product',
          description: 'Updated description',
          stock: 15
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockProduct);
    });

    it('should return 404 for non-existent product', async () => {
      (productService.updateProduct as jest.Mock) = jest.fn().mockResolvedValue(null);

      const response = await request(server)
        .put('/api/products/507f1f77bcf86cd799439011')
        .send({
          name: 'Updated Product'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should archive product successfully', async () => {
      (productService.archiveProduct as jest.Mock) = jest.fn().mockResolvedValue(true);

      const response = await request(server).delete('/api/products/507f1f77bcf86cd799439011');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Product archived successfully');
    });

    it('should return 404 for non-existent product', async () => {
      (productService.archiveProduct as jest.Mock) = jest.fn().mockResolvedValue(false);

      const response = await request(server).delete('/api/products/507f1f77bcf86cd799439011');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/products', () => {
    it('should list products with pagination', async () => {
      const mockResponse = {
        data: [
          {
            _id: '1',
            name: 'Product 1',
            description: 'Description 1',
            category: 'Electronics',
            prices: [{ currency: Currency.USD, amount: 99.99 }],
            stock: 10,
            status: ProductStatus.ACTIVE
          }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1
        }
      };

      (productService.listProducts as jest.Mock) = jest.fn().mockResolvedValue(mockResponse);

      const response = await request(server).get('/api/products?page=1&limit=20');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockResponse.data);
      expect(response.body.pagination).toEqual(mockResponse.pagination);
    });

    it('should filter products by category', async () => {
      const mockResponse = {
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        }
      };

      (productService.listProducts as jest.Mock) = jest.fn().mockResolvedValue(mockResponse);

      const response = await request(server).get('/api/products?category=Electronics');

      expect(response.status).toBe(200);
      expect(productService.listProducts).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'Electronics' }),
        expect.any(Object)
      );
    });
  });

  describe('GET /api/products/search', () => {
    it('should search products', async () => {
      const mockResponse = {
        data: [
          {
            _id: '1',
            name: 'Laptop',
            description: 'High-performance laptop',
            category: 'Electronics',
            prices: [{ currency: Currency.USD, amount: 999.99 }],
            stock: 3,
            status: ProductStatus.ACTIVE
          }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1
        }
      };

      (productService.searchProducts as jest.Mock) = jest.fn().mockResolvedValue(mockResponse);

      const response = await request(server).get('/api/products/search?q=laptop');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockResponse.data);
    });

    it('should return 400 if search term is missing', async () => {
      const response = await request(server).get('/api/products/search');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/products/categories', () => {
    it('should create category successfully', async () => {
      const mockCategory = {
        _id: '123',
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic products',
        isActive: true
      };

      (productService.createCategory as jest.Mock) = jest.fn().mockResolvedValue(mockCategory);

      const response = await request(server)
        .post('/api/products/categories')
        .send({
          name: 'Electronics',
          description: 'Electronic products'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockCategory);
    });
  });

  describe('GET /api/products/categories', () => {
    it('should list categories', async () => {
      const mockCategories = [
        {
          _id: '1',
          name: 'Electronics',
          slug: 'electronics',
          isActive: true
        },
        {
          _id: '2',
          name: 'Clothing',
          slug: 'clothing',
          isActive: true
        }
      ];

      (productService.listCategories as jest.Mock) = jest.fn().mockResolvedValue(mockCategories);

      const response = await request(server).get('/api/products/categories');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockCategories);
    });

    it('should list categories with subcategories', async () => {
      const mockCategories = [
        {
          _id: '1',
          name: 'Electronics',
          slug: 'electronics',
          isActive: true,
          subcategories: []
        }
      ];

      (productService.getCategoriesWithSubcategories as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockCategories);

      const response = await request(server).get('/api/products/categories?subcategories=true');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
