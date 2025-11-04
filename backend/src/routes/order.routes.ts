import { Router } from 'express';
import {
  createOrder,
  getOrder,
  getOrders,
  updateOrderStatus,
  cancelOrder,
  requestRefund,
  requestReturn,
  getOrderTracking,
  getOrderInvoice,
} from '../controllers/order.controller';
import { isAdmin, validateRequest } from '../middleware/admin.middleware';
import { orderValidators } from '../validators/order.validator';

const router = Router();

// Public/User routes
router.post('/', orderValidators.create, validateRequest, createOrder);
router.get('/', orderValidators.getOrders, validateRequest, getOrders);
router.get('/:orderId', orderValidators.getOrder, validateRequest, getOrder);
router.get('/:orderId/tracking', orderValidators.tracking, validateRequest, getOrderTracking);
router.get('/:orderId/invoice', orderValidators.invoice, validateRequest, getOrderInvoice);

// User actions
router.put('/:orderId/cancel', orderValidators.cancelOrder, validateRequest, cancelOrder);
router.post('/:orderId/refund', orderValidators.refund, validateRequest, requestRefund);
router.post('/:orderId/return', orderValidators.return, validateRequest, requestReturn);

// Admin routes
router.put(
  '/:orderId/status',
  isAdmin,
  orderValidators.updateStatus,
  validateRequest,
  updateOrderStatus
);

export default router;
