import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service';

export class ProductController {
  async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        categoryId,
        minPrice,
        maxPrice,
        inStock,
        onSale,
        search,
        isFeatured,
        sortBy,
        page,
        limit,
      } = req.query;

      const filters = {
        categoryId: categoryId as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        inStock: inStock === 'true',
        onSale: onSale === 'true',
        search: search as string,
        isFeatured: isFeatured === 'true' ? true : undefined,
        sortBy: sortBy as any,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
        isActive: true,
      };

      const result = await productService.getProducts(filters);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);

      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFeaturedProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { limit } = req.query;
      const products = await productService.getFeaturedProducts(
        limit ? parseInt(limit as string, 10) : 10
      );

      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOnSaleProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = req.query;
      const result = await productService.getOnSaleProducts(
        page ? parseInt(page as string, 10) : 1,
        limit ? parseInt(limit as string, 10) : 20
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRelatedProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { limit } = req.query;
      const products = await productService.getRelatedProducts(
        id,
        limit ? parseInt(limit as string, 10) : 4
      );

      if (products === null) {
        res.status(404).json({
          success: false,
          message: 'Product not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await productService.getCategories();

      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const category = await productService.getCategoryById(id);

      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Category not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const category = await productService.getCategoryBySlug(slug);

      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Category not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
