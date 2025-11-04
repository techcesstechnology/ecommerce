import { Router } from 'express';
import {
  getOrders,
  getOrderById,
  getOrderByNumber,
  createOrder,
  updateOrder,
  cancelOrder,
  getOrdersByUser,
  getOrderStats,
} from '../controllers/order.controller';
import { isAdmin } from '../middleware/admin.middleware';

const router = Router();

// Admin routes - protected
router.get('/', isAdmin, getOrders);
router.get('/stats', isAdmin, getOrderStats);
router.get('/number/:orderNumber', getOrderByNumber);
router.get('/user/:userId', getOrdersByUser);
router.get('/:id', getOrderById);

router.post('/', createOrder);
router.put('/:id', isAdmin, updateOrder);
router.post('/:id/cancel', cancelOrder);

export default router;
