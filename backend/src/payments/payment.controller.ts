import { Request, Response } from 'express';
import { paymentService } from './payment.service';
import { ApiResponse, PaymentInitializeRequest, PaymentVerifyRequest } from '../types';

export class PaymentController {
  async initializePayment(req: Request, res: Response): Promise<void> {
    try {
      const request: PaymentInitializeRequest = req.body;

      if (!request.orderId || !request.amount || !request.currency || !request.method) {
        const response: ApiResponse = {
          success: false,
          error: 'Missing required fields',
        };
        res.status(400).json(response);
        return;
      }

      const result = await paymentService.initializePayment(request);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Payment initialized successfully',
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Failed to initialize payment',
      };
      res.status(400).json(response);
    }
  }

  async verifyPayment(req: Request, res: Response): Promise<void> {
    try {
      const request: PaymentVerifyRequest = req.body;

      if (!request.paymentId) {
        const response: ApiResponse = {
          success: false,
          error: 'Payment ID is required',
        };
        res.status(400).json(response);
        return;
      }

      const payment = await paymentService.verifyPayment(request);

      const response: ApiResponse = {
        success: true,
        data: payment,
        message: 'Payment verified successfully',
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Failed to verify payment',
      };
      res.status(400).json(response);
    }
  }
}

export const paymentController = new PaymentController();
