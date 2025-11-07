import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Initiate payment (protected route)
router.post('/initiate', authenticate, paymentController.initiatePayment);

// Check payment status (protected route)
router.get('/status/:transactionReference', authenticate, paymentController.checkPaymentStatus);

// Get payment details (protected route)
router.get('/:id', authenticate, paymentController.getPaymentDetails);

// Get payments for an order (protected route)
router.get('/order/:orderId', authenticate, paymentController.getPaymentsByOrderId);

// Pesepay callback/webhook (public route - Pesepay will call this)
router.post('/pesepay/callback', paymentController.pesepayCallback as any);

export default router;
