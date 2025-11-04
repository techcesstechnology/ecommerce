import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  applyDiscount,
  removeDiscount,
  getCartSummary,
  saveForLater,
  getSavedItems,
  moveToCart,
  shareCart,
  mergeCarts,
} from '../controllers/cart.controller';
import { validateRequest } from '../middleware/admin.middleware';
import { cartValidators } from '../validators/cart.validator';

const router = Router();

// Cart operations
router.get('/', getCart);
router.get('/summary', getCartSummary);
router.post('/items', cartValidators.addItem, validateRequest, addToCart);
router.put('/items/:itemId', cartValidators.updateItem, validateRequest, updateCartItem);
router.delete('/items/:itemId', cartValidators.removeItem, validateRequest, removeCartItem);
router.delete('/', clearCart);

// Discount operations
router.post('/discount', cartValidators.applyDiscount, validateRequest, applyDiscount);
router.delete('/discount', removeDiscount);

// Save for later operations
router.post('/save-for-later/:itemId', cartValidators.saveForLater, validateRequest, saveForLater);
router.get('/saved', getSavedItems);
router.post('/saved/:itemId/move', cartValidators.moveToCart, validateRequest, moveToCart);

// Cart sharing
router.post('/share', cartValidators.shareCart, validateRequest, shareCart);

// Cart merging
router.post('/merge', cartValidators.mergeCarts, validateRequest, mergeCarts);

export default router;
