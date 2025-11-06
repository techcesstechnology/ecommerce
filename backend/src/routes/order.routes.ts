import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/checkout', orderController.createOrderFromCart);
router.get('/', orderController.getMyOrders);
router.get('/stats', orderController.getOrderStats);
router.get('/number/:orderNumber', orderController.getOrderByNumber);
router.get('/:id', orderController.getOrderById);
router.put('/:id/cancel', orderController.cancelOrder);

export default router;
