import { Response, NextFunction } from 'express';
import { orderService } from '../services/order.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../utils/errors';

export class OrderController {
  async createOrderFromCart(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const {
        shippingAddress,
        paymentMethod,
        deliverySlotId,
        deliveryDate,
        deliveryTimeStart,
        deliveryTimeEnd,
        notes,
      } = req.body;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!shippingAddress || !paymentMethod) {
        throw new AppError('Shipping address and payment method are required', 400);
      }

      const order = await orderService.createOrderFromCart(
        userId,
        shippingAddress,
        paymentMethod,
        deliverySlotId,
        deliveryDate,
        deliveryTimeStart,
        deliveryTimeEnd,
        notes
      );

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyOrders(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { page, limit } = req.query;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const result = await orderService.getUserOrders(
        userId,
        page ? parseInt(page as string, 10) : 1,
        limit ? parseInt(limit as string, 10) : 10
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const order = await orderService.getOrderById(id);

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found',
        });
        return;
      }

      if (order.userId !== userId) {
        throw new AppError('Unauthorized to view this order', 403);
      }

      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrderByNumber(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { orderNumber } = req.params;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const order = await orderService.getOrderByNumber(orderNumber);

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found',
        });
        return;
      }

      if (order.userId !== userId) {
        throw new AppError('Unauthorized to view this order', 403);
      }

      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelOrder(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const order = await orderService.cancelOrderWithInventoryRestore(id, userId);

      res.status(200).json({
        success: true,
        message: 'Order cancelled successfully',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrderStats(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const stats = await orderService.getOrderStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();
