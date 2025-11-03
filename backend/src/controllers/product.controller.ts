import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service';
import { imageService } from '../services/image.service';
import {
  createProductSchema,
  updateProductSchema,
  productFilterSchema,
  createCategorySchema,
  productIdSchema
} from '../validators/product.validator';
import { CreateProductDTO, UpdateProductDTO, CreateCategoryDTO } from '../types/product.types';

export class ProductController {
  /**
   * Create a new product
   * POST /api/products
   */
  async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error, value } = createProductSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(d => d.message)
        });
        return;
      }

      const productData: CreateProductDTO = value;
      const userId = (req as any).user?.id;

      const product = await productService.createProduct(productData, userId);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get product by ID
   * GET /api/products/:id
   */
  async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error } = productIdSchema.validate({ id: req.params.id });
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Invalid product ID'
        });
        return;
      }

      const product = await productService.getProductById(req.params.id);

      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update product
   * PUT /api/products/:id
   */
  async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error: idError } = productIdSchema.validate({ id: req.params.id });
      if (idError) {
        res.status(400).json({
          success: false,
          message: 'Invalid product ID'
        });
        return;
      }

      const { error, value } = updateProductSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(d => d.message)
        });
        return;
      }

      const updateData: UpdateProductDTO = value;
      const userId = (req as any).user?.id;

      const product = await productService.updateProduct(req.params.id, updateData, userId);

      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Archive product (soft delete)
   * DELETE /api/products/:id
   */
  async archiveProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error } = productIdSchema.validate({ id: req.params.id });
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Invalid product ID'
        });
        return;
      }

      const userId = (req as any).user?.id;
      const result = await productService.archiveProduct(req.params.id, userId);

      if (!result) {
        res.status(404).json({
          success: false,
          message: 'Product not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Product archived successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List products with filtering and pagination
   * GET /api/products
   */
  async listProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error, value } = productFilterSchema.validate(req.query);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(d => d.message)
        });
        return;
      }

      const { page, limit, ...filter } = value;

      const result = await productService.listProducts(filter, { page, limit });

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search products
   * GET /api/products/search
   */
  async searchProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const searchTerm = req.query.q as string;
      
      if (!searchTerm || searchTerm.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'Search term is required'
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await productService.searchProducts(searchTerm, { page, limit });

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create category
   * POST /api/products/categories
   */
  async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error, value } = createCategorySchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(d => d.message)
        });
        return;
      }

      const categoryData: CreateCategoryDTO = value;
      const category = await productService.createCategory(categoryData);

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List categories
   * GET /api/products/categories
   */
  async listCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const withSubcategories = req.query.subcategories === 'true';

      const categories = withSubcategories
        ? await productService.getCategoriesWithSubcategories()
        : await productService.listCategories();

      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload product images
   * POST /api/products/:id/images
   */
  async uploadImages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error } = productIdSchema.validate({ id: req.params.id });
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Invalid product ID'
        });
        return;
      }

      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        res.status(400).json({
          success: false,
          message: 'No images provided'
        });
        return;
      }

      const files = req.files as Express.Multer.File[];
      
      // Validate all files
      for (const file of files) {
        const validation = imageService.validateImageFile(file);
        if (!validation.valid) {
          res.status(400).json({
            success: false,
            message: validation.error
          });
          return;
        }
      }

      // Process images
      const images = await imageService.processMultipleImages(files, req.params.id);

      // Update product with new images
      const product = await productService.getProductById(req.params.id);
      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found'
        });
        return;
      }

      const existingImages = product.images || [];
      const updatedProduct = await productService.updateProduct(
        req.params.id,
        { images: [...existingImages, ...images] },
        (req as any).user?.id
      );

      res.status(200).json({
        success: true,
        message: 'Images uploaded successfully',
        data: updatedProduct
      });
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
