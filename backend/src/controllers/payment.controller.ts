import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { paymentService } from '../services/payment.service';
import { AppError } from '../utils/errors';
import { Currency, PaymentMethod } from '../types/payment.types';

export class PaymentController {
  async initiatePayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { orderId, paymentMethod, customerPhone, customerEmail, currency } = req.body;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!orderId || !paymentMethod) {
        throw new AppError('Order ID and payment method are required', 400);
      }

      // Validate payment method for EcoCash
      if (paymentMethod === 'ecocash' && !customerPhone) {
        throw new AppError('Phone number is required for EcoCash payments', 400);
      }

      // Get order to extract amount
      const { orderService } = await import('../services/order.service');
      const order = await orderService.getOrderById(orderId.toString());

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      if (order.userId !== Number(userId)) {
        throw new AppError('Unauthorized to access this order', 403);
      }

      // Initiate payment
      const paymentResult = await paymentService.initiatePayment({
        orderId: Number(orderId),
        userId: Number(userId),
        amount: Number(order.total),
        currency: (currency || 'ZWL') as Currency,
        paymentMethod: paymentMethod as PaymentMethod,
        customerPhone,
        customerEmail: customerEmail || req.user?.email,
        description: `Payment for Order ${order.orderNumber}`,
      });

      res.status(200).json({
        success: true,
        message: paymentResult.message,
        data: {
          transactionId: paymentResult.transactionId,
          transactionReference: paymentResult.transactionReference,
          status: paymentResult.status,
          pollUrl: paymentResult.pollUrl,
          redirectUrl: paymentResult.redirectUrl,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async checkPaymentStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { transactionReference } = req.params;

      if (!transactionReference) {
        throw new AppError('Transaction reference is required', 400);
      }

      const payment = await paymentService.checkPaymentStatus(transactionReference);

      if (!payment) {
        throw new AppError('Payment transaction not found', 404);
      }

      res.status(200).json({
        success: true,
        data: {
          transactionId: payment.id,
          orderId: payment.orderId,
          transactionReference: payment.transactionReference,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          paymentMethod: payment.paymentMethod,
          customerPhone: payment.customerPhone,
          paidAt: payment.paidAt,
          errorMessage: payment.errorMessage,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getPaymentDetails(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const payment = await paymentService.getPaymentById(Number(id));

      if (!payment) {
        throw new AppError('Payment not found', 404);
      }

      if (payment.userId !== Number(userId)) {
        throw new AppError('Unauthorized to access this payment', 403);
      }

      res.status(200).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPaymentsByOrderId(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { orderId } = req.params;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      // Verify the order belongs to the requesting user
      const { orderService } = await import('../services/order.service');
      const order = await orderService.getOrderById(orderId);

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      if (order.userId !== Number(userId)) {
        throw new AppError('Unauthorized to access payments for this order', 403);
      }

      const payments = await paymentService.getPaymentsByOrderId(Number(orderId));

      res.status(200).json({
        success: true,
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  }

  async pesepayCallback(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      // Handle Pesepay callback/webhook
      const { transactionReference, status, amount } = req.body;

      console.log('Pesepay callback received:', { transactionReference, status, amount });

      if (status === 'paid') {
        const payment = await paymentService.checkPaymentStatus(transactionReference);
        
        if (payment) {
          // Payment status will be updated by checkPaymentStatus
          res.status(200).json({ success: true, message: 'Payment confirmed' });
        } else {
          res.status(404).json({ success: false, message: 'Transaction not found' });
        }
      } else {
        res.status(200).json({ success: true, message: 'Callback received' });
      }
    } catch (error) {
      console.error('Pesepay callback error:', error);
      next(error);
    }
  }
}

export const paymentController = new PaymentController();
