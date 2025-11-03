import { Router } from 'express';
import { cartController } from '../cart/cart.controller';
import { orderController } from '../orders/order.controller';
import { paymentController } from '../payments/payment.controller';
import { invoiceController } from '../invoices/invoice.controller';

const router = Router();

// Cart routes
router.post('/api/cart/add', (req, res) => cartController.addToCart(req, res));
router.put('/api/cart/update', (req, res) => cartController.updateCartItem(req, res));
router.delete('/api/cart/remove', (req, res) => cartController.removeFromCart(req, res));
router.get('/api/cart', (req, res) => cartController.getCart(req, res));

// Order routes
router.post('/api/orders', (req, res) => orderController.createOrder(req, res));
router.get('/api/orders', (req, res) => orderController.listOrders(req, res));
router.get('/api/orders/:id', (req, res) => orderController.getOrder(req, res));
router.put('/api/orders/:id/status', (req, res) => orderController.updateOrderStatus(req, res));

// Payment routes
router.post('/api/payments/initialize', (req, res) => paymentController.initializePayment(req, res));
router.post('/api/payments/verify', (req, res) => paymentController.verifyPayment(req, res));

// Invoice routes
router.get('/api/invoices/:id', (req, res) => invoiceController.generateInvoice(req, res));

export default router;
