import { Router } from 'express';
import {
  getProducts,
  getProductById,
  getProductBySku,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
  getProductsByCategory,
  getLowStockProducts,
} from '../controllers/product.controller';
import { isAdmin, validateRequest } from '../middleware/admin.middleware';
import { productValidators } from '../validators/product.validator';

const router = Router();

// Public routes (no authentication required)
router.get('/', productValidators.filters, validateRequest, getProducts);
router.get('/low-stock', getLowStockProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/sku/:sku', getProductBySku);
router.get('/:id', getProductById);

// Protected routes (admin only)
router.post('/', isAdmin, productValidators.create, validateRequest, createProduct);
router.put('/:id', isAdmin, productValidators.update, validateRequest, updateProduct);
router.delete('/:id', isAdmin, deleteProduct);
router.patch(
  '/:id/stock',
  isAdmin,
  productValidators.updateStock,
  validateRequest,
  updateProductStock
);

export default router;
