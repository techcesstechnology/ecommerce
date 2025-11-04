import { Request, Response } from 'express';
import { categoryService } from '../services/category.service';
import { formatResponse, formatError } from '../utils';

/**
 * Get all categories
 */
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const status = req.query.status as 'active' | 'inactive' | undefined;
    const categories = await categoryService.getCategories(status);
    res.status(200).json(formatResponse(categories, 'Categories retrieved successfully'));
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json(formatError('Failed to retrieve categories', error));
  }
};

/**
 * Get a single category by ID
 */
export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await categoryService.getCategoryById(id);

    if (!category) {
      res.status(404).json(formatError('Category not found'));
      return;
    }

    res.status(200).json(formatResponse(category, 'Category retrieved successfully'));
  } catch (error) {
    console.error('Error getting category:', error);
    res.status(500).json(formatError('Failed to retrieve category', error));
  }
};

/**
 * Get a category by slug
 */
export const getCategoryBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const category = await categoryService.getCategoryBySlug(slug);

    if (!category) {
      res.status(404).json(formatError('Category not found'));
      return;
    }

    res.status(200).json(formatResponse(category, 'Category retrieved successfully'));
  } catch (error) {
    console.error('Error getting category by slug:', error);
    res.status(500).json(formatError('Failed to retrieve category', error));
  }
};

/**
 * Get subcategories of a parent category
 */
export const getSubcategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const subcategories = await categoryService.getSubcategories(id);
    res.status(200).json(formatResponse(subcategories, 'Subcategories retrieved successfully'));
  } catch (error) {
    console.error('Error getting subcategories:', error);
    res.status(500).json(formatError('Failed to retrieve subcategories', error));
  }
};

/**
 * Get root categories
 */
export const getRootCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await categoryService.getRootCategories();
    res.status(200).json(formatResponse(categories, 'Root categories retrieved successfully'));
  } catch (error) {
    console.error('Error getting root categories:', error);
    res.status(500).json(formatError('Failed to retrieve root categories', error));
  }
};

/**
 * Get category tree
 */
export const getCategoryTree = async (_req: Request, res: Response): Promise<void> => {
  try {
    const tree = await categoryService.getCategoryTree();
    res.status(200).json(formatResponse(tree, 'Category tree retrieved successfully'));
  } catch (error) {
    console.error('Error getting category tree:', error);
    res.status(500).json(formatError('Failed to retrieve category tree', error));
  }
};

/**
 * Create a new category
 */
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json(formatResponse(category, 'Category created successfully'));
  } catch (error) {
    console.error('Error creating category:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create category';
    res.status(400).json(formatError(errorMessage, error));
  }
};

/**
 * Update a category
 */
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await categoryService.updateCategory(id, req.body);

    if (!category) {
      res.status(404).json(formatError('Category not found'));
      return;
    }

    res.status(200).json(formatResponse(category, 'Category updated successfully'));
  } catch (error) {
    console.error('Error updating category:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update category';
    res.status(400).json(formatError(errorMessage, error));
  }
};

/**
 * Delete a category
 */
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await categoryService.deleteCategory(id);

    if (!deleted) {
      res.status(404).json(formatError('Category not found'));
      return;
    }

    res.status(200).json(formatResponse(null, 'Category deleted successfully'));
  } catch (error) {
    console.error('Error deleting category:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete category';
    res.status(400).json(formatError(errorMessage, error));
  }
};
