import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);
router.patch('/products/:id/stock', adminController.updateProductStock);

router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

router.get('/orders', adminController.getAllOrders);
router.patch('/orders/:id/status', adminController.updateOrderStatus);

router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/role', adminController.updateUserRole);
router.patch('/users/:id/deactivate', adminController.deactivateUser);

router.get('/delivery-slots', adminController.getAllDeliverySlots);
router.post('/delivery-slots', adminController.createDeliverySlot);
router.put('/delivery-slots/:id', adminController.updateDeliverySlot);
router.delete('/delivery-slots/:id', adminController.deleteDeliverySlot);

router.get('/promotions', adminController.getAllPromotions);
router.post('/promotions', adminController.createPromotion);
router.put('/promotions/:id', adminController.updatePromotion);
router.delete('/promotions/:id', adminController.deletePromotion);

router.get('/dashboard/stats', adminController.getDashboardStats);

export default router;
