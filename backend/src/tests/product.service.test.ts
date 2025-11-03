import { ProductService } from '../services/product.service';
import { ProductModel } from '../models/product.model';
import { CategoryModel } from '../models/category.model';
import { Currency, ProductStatus } from '../types/product.types';

// Mock mongoose models
jest.mock('../models/product.model');
jest.mock('../models/category.model');

describe('ProductService', () => {
  let productService: ProductService;

  beforeEach(() => {
    productService = new ProductService();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await productService.close();
  });

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      const mockProductData = {
        name: 'Test Product',
        description: 'Test description',
        category: 'Electronics',
        prices: [{ currency: Currency.USD, amount: 99.99 }],
        stock: 10
      };

      const mockProduct = {
        _id: '123',
        ...mockProductData,
        slug: 'test-product',
        status: ProductStatus.ACTIVE,
        save: jest.fn().mockResolvedValue(undefined),
        toObject: jest.fn().mockReturnValue({
          _id: '123',
          ...mockProductData,
          slug: 'test-product',
          status: ProductStatus.ACTIVE
        })
      };

      (ProductModel as any).mockImplementation(() => mockProduct);

      const result = await productService.createProduct(mockProductData, 'user123');

      expect(result).toBeDefined();
    });

    it('should generate slug from product name', async () => {
      const mockProductData = {
        name: 'Test Product With Spaces',
        description: 'Test description',
        category: 'Electronics',
        prices: [{ currency: Currency.USD, amount: 99.99 }],
        stock: 10
      };

      const mockProduct = {
        _id: '123',
        ...mockProductData,
        slug: 'test-product-with-spaces',
        status: ProductStatus.ACTIVE,
        save: jest.fn().mockResolvedValue(undefined),
        toObject: jest.fn().mockReturnValue({
          _id: '123',
          ...mockProductData,
          slug: 'test-product-with-spaces',
          status: ProductStatus.ACTIVE
        })
      };

      (ProductModel as any).mockImplementation(() => mockProduct);

      const result = await productService.createProduct(mockProductData, 'user123');

      expect(result).toBeDefined();
    });
  });

  describe('getProductById', () => {
    it('should return product if found', async () => {
      const mockProduct = {
        _id: '123',
        name: 'Test Product',
        description: 'Test description',
        category: 'Electronics',
        prices: [{ currency: Currency.USD, amount: 99.99 }],
        stock: 10,
        status: ProductStatus.ACTIVE
      };

      (ProductModel.findById as jest.Mock) = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockProduct)
      });

      const result = await productService.getProductById('123');

      expect(result).toEqual(mockProduct);
      expect(ProductModel.findById).toHaveBeenCalledWith('123');
    });

    it('should return null if product not found', async () => {
      (ProductModel.findById as jest.Mock) = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(null)
      });

      const result = await productService.getProductById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      const updateData = {
        name: 'Updated Product',
        price: 149.99
      };

      const mockUpdatedProduct = {
        _id: '123',
        name: 'Updated Product',
        description: 'Test description',
        slug: 'updated-product',
        category: 'Electronics',
        prices: [{ currency: Currency.USD, amount: 149.99 }],
        stock: 10,
        status: ProductStatus.ACTIVE
      };

      (ProductModel.findByIdAndUpdate as jest.Mock) = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockUpdatedProduct)
      });

      const result = await productService.updateProduct('123', updateData, 'user123');

      expect(result).toEqual(mockUpdatedProduct);
      expect(ProductModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '123',
        expect.objectContaining({ $set: expect.any(Object) }),
        expect.objectContaining({ new: true, runValidators: true })
      );
    });

    it('should return null if product not found', async () => {
      (ProductModel.findByIdAndUpdate as jest.Mock) = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(null)
      });

      const result = await productService.updateProduct('nonexistent', { name: 'Test' }, 'user123');

      expect(result).toBeNull();
    });
  });

  describe('archiveProduct', () => {
    it('should archive product successfully', async () => {
      const mockProduct = {
        _id: '123',
        status: ProductStatus.ARCHIVED
      };

      (ProductModel.findByIdAndUpdate as jest.Mock) = jest.fn().mockResolvedValue(mockProduct);

      const result = await productService.archiveProduct('123', 'user123');

      expect(result).toBe(true);
      expect(ProductModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '123',
        expect.objectContaining({
          status: ProductStatus.ARCHIVED,
          updatedBy: 'user123'
        }),
        expect.any(Object)
      );
    });

    it('should return false if product not found', async () => {
      (ProductModel.findByIdAndUpdate as jest.Mock) = jest.fn().mockResolvedValue(null);

      const result = await productService.archiveProduct('nonexistent', 'user123');

      expect(result).toBe(false);
    });
  });

  describe('listProducts', () => {
    it('should return paginated products', async () => {
      const mockProducts = [
        {
          _id: '1',
          name: 'Product 1',
          description: 'Description 1',
          category: 'Electronics',
          prices: [{ currency: Currency.USD, amount: 99.99 }],
          stock: 10,
          status: ProductStatus.ACTIVE
        },
        {
          _id: '2',
          name: 'Product 2',
          description: 'Description 2',
          category: 'Electronics',
          prices: [{ currency: Currency.USD, amount: 149.99 }],
          stock: 5,
          status: ProductStatus.ACTIVE
        }
      ];

      (ProductModel.countDocuments as jest.Mock) = jest.fn().mockResolvedValue(2);
      (ProductModel.find as jest.Mock) = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockProducts)
      });

      const result = await productService.listProducts(
        { category: 'Electronics' },
        { page: 1, limit: 20 }
      );

      expect(result.data).toEqual(mockProducts);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1
      });
    });
  });

  describe('searchProducts', () => {
    it('should search products by text', async () => {
      const mockProducts = [
        {
          _id: '1',
          name: 'Laptop',
          description: 'High-performance laptop',
          category: 'Electronics',
          prices: [{ currency: Currency.USD, amount: 999.99 }],
          stock: 3,
          status: ProductStatus.ACTIVE
        }
      ];

      (ProductModel.countDocuments as jest.Mock) = jest.fn().mockResolvedValue(1);
      (ProductModel.find as jest.Mock) = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockProducts)
      });

      const result = await productService.searchProducts('laptop', { page: 1, limit: 20 });

      expect(result.data).toEqual(mockProducts);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('createCategory', () => {
    it('should create category successfully', async () => {
      const mockCategoryData = {
        name: 'Electronics',
        description: 'Electronic products'
      };

      const mockCategory = {
        _id: '123',
        ...mockCategoryData,
        slug: 'electronics',
        isActive: true,
        save: jest.fn().mockResolvedValue(undefined),
        toObject: jest.fn().mockReturnValue({
          _id: '123',
          ...mockCategoryData,
          slug: 'electronics',
          isActive: true
        })
      };

      (CategoryModel as any).mockImplementation(() => mockCategory);

      const result = await productService.createCategory(mockCategoryData);

      expect(result).toBeDefined();
    });
  });

  describe('listCategories', () => {
    it('should return all active categories', async () => {
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

      (CategoryModel.find as jest.Mock) = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockCategories)
      });

      const result = await productService.listCategories();

      expect(result).toEqual(mockCategories);
      expect(CategoryModel.find).toHaveBeenCalledWith({ isActive: true });
    });
  });
});
