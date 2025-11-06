import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createProductValidation,
  updateProductValidation,
  idParamValidation,
  createCategoryValidation,
  updateCategoryValidation,
  updateOrderStatusValidation,
  updateUserRoleValidation,
  createDeliverySlotValidation,
  updateDeliverySlotValidation,
  createPromotionValidation,
  updatePromotionValidation,
} from '../validators/admin.validators';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

router.post('/products', validate(createProductValidation), adminController.createProduct);
router.put('/products/:id', validate(updateProductValidation), adminController.updateProduct);
router.delete('/products/:id', validate(idParamValidation), adminController.deleteProduct);

router.post('/categories', validate(createCategoryValidation), adminController.createCategory);
router.put('/categories/:id', validate(updateCategoryValidation), adminController.updateCategory);
router.delete('/categories/:id', validate(idParamValidation), adminController.deleteCategory);

router.get('/orders', adminController.getAllOrders);
router.patch('/orders/:id/status', validate(updateOrderStatusValidation), adminController.updateOrderStatus);

router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/role', validate(updateUserRoleValidation), adminController.updateUserRole);

router.get('/delivery-slots/:id', validate(idParamValidation), adminController.getDeliverySlot);
router.get('/delivery-slots', adminController.getAllDeliverySlots);
router.post('/delivery-slots', validate(createDeliverySlotValidation), adminController.createDeliverySlot);
router.put('/delivery-slots/:id', validate(updateDeliverySlotValidation), adminController.updateDeliverySlot);
router.delete('/delivery-slots/:id', validate(idParamValidation), adminController.deleteDeliverySlot);

router.get('/promotions/:id', validate(idParamValidation), adminController.getPromotion);
router.get('/promotions', adminController.getAllPromotions);
router.post('/promotions', validate(createPromotionValidation), adminController.createPromotion);
router.put('/promotions/:id', validate(updatePromotionValidation), adminController.updatePromotion);
router.delete('/promotions/:id', validate(idParamValidation), adminController.deletePromotion);

router.get('/dashboard/stats', adminController.getDashboardStats);

export default router;
