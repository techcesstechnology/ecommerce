import { Request, Response } from 'express';
import { productService } from '../services/product.service';
import { formatResponse, formatError } from '../utils';
import { ProductFilters } from '../models/product.model';

/**
 * Get all products with filters and pagination
 */
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters: ProductFilters = {
      category: req.query.category as string,
      status: req.query.status as 'draft' | 'published' | 'archived',
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
    };

    const result = await productService.getProducts(filters);
    res.status(200).json(formatResponse(result, 'Products retrieved successfully'));
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json(formatError('Failed to retrieve products', error));
  }
};

/**
 * Get a single product by ID
 */
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    if (!product) {
      res.status(404).json(formatError('Product not found'));
      return;
    }

    res.status(200).json(formatResponse(product, 'Product retrieved successfully'));
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json(formatError('Failed to retrieve product', error));
  }
};

/**
 * Get a product by SKU
 */
export const getProductBySku = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sku } = req.params;
    const product = await productService.getProductBySku(sku);

    if (!product) {
      res.status(404).json(formatError('Product not found'));
      return;
    }

    res.status(200).json(formatResponse(product, 'Product retrieved successfully'));
  } catch (error) {
    console.error('Error getting product by SKU:', error);
    res.status(500).json(formatError('Failed to retrieve product', error));
  }
};

/**
 * Create a new product
 */
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(formatResponse(product, 'Product created successfully'));
  } catch (error) {
    console.error('Error creating product:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create product';
    res.status(400).json(formatError(errorMessage, error));
  }
};

/**
 * Update a product
 */
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await productService.updateProduct(id, req.body);

    if (!product) {
      res.status(404).json(formatError('Product not found'));
      return;
    }

    res.status(200).json(formatResponse(product, 'Product updated successfully'));
  } catch (error) {
    console.error('Error updating product:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update product';
    res.status(400).json(formatError(errorMessage, error));
  }
};

/**
 * Delete a product
 */
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await productService.deleteProduct(id);

    if (!deleted) {
      res.status(404).json(formatError('Product not found'));
      return;
    }

    res.status(200).json(formatResponse(null, 'Product deleted successfully'));
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json(formatError('Failed to delete product', error));
  }
};

/**
 * Update product stock
 */
export const updateProductStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    const product = await productService.updateStock(id, stock);

    if (!product) {
      res.status(404).json(formatError('Product not found'));
      return;
    }

    res.status(200).json(formatResponse(product, 'Product stock updated successfully'));
  } catch (error) {
    console.error('Error updating product stock:', error);
    res.status(500).json(formatError('Failed to update product stock', error));
  }
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.params;
    const products = await productService.getProductsByCategory(category);
    res.status(200).json(formatResponse(products, 'Products retrieved successfully'));
  } catch (error) {
    console.error('Error getting products by category:', error);
    res.status(500).json(formatError('Failed to retrieve products', error));
  }
};

/**
 * Get low stock products
 */
export const getLowStockProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const threshold = req.query.threshold ? parseInt(req.query.threshold as string, 10) : 10;
    const products = await productService.getLowStockProducts(threshold);
    res.status(200).json(formatResponse(products, 'Low stock products retrieved successfully'));
  } catch (error) {
    console.error('Error getting low stock products:', error);
    res.status(500).json(formatError('Failed to retrieve low stock products', error));
  }
};
