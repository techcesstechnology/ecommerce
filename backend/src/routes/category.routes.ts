import { Router } from 'express';
import {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  getSubcategories,
  getRootCategories,
  getCategoryTree,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller';
import { isAdmin, validateRequest } from '../middleware/admin.middleware';
import { categoryValidators } from '../validators/category.validator';

const router = Router();

// Public routes (no authentication required)
router.get('/', getCategories);
router.get('/tree', getCategoryTree);
router.get('/root', getRootCategories);
router.get('/slug/:slug', getCategoryBySlug);
router.get('/:id', getCategoryById);
router.get('/:id/subcategories', getSubcategories);

// Protected routes (admin only)
router.post('/', isAdmin, categoryValidators.create, validateRequest, createCategory);
router.put('/:id', isAdmin, categoryValidators.update, validateRequest, updateCategory);
router.delete('/:id', isAdmin, deleteCategory);

export default router;
