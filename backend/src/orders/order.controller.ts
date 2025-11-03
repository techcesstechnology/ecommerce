import { Request, Response } from 'express';
import { orderService } from './order.service';
import {
  createOrderSchema,
  listOrdersSchema,
  getOrderSchema,
  updateOrderStatusSchema,
} from './order.validator';
import { ApiResponse } from '../types';

export class OrderController {
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createOrderSchema.parse(req.body);
      const order = await orderService.createOrder(validatedData);

      const response: ApiResponse = {
        success: true,
        data: order,
        message: 'Order created successfully',
      };

      res.status(201).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Failed to create order',
      };
      res.status(400).json(response);
    }
  }

  async listOrders(req: Request, res: Response): Promise<void> {
    try {
      const { userId, status, page, limit } = req.query;
      const validatedData = listOrdersSchema.parse({
        userId,
        status,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });

      const result = await orderService.listOrders(validatedData);

      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Failed to list orders',
      };
      res.status(400).json(response);
    }
  }

  async getOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { userId } = req.query;

      const validatedData = getOrderSchema.parse({
        orderId: id,
        userId,
      });

      const order = await orderService.getOrder(
        validatedData.orderId,
        validatedData.userId
      );

      if (!order) {
        const response: ApiResponse = {
          success: false,
          error: 'Order not found',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: order,
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Failed to get order',
      };
      res.status(400).json(response);
    }
  }

  async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateOrderStatusSchema.parse({
        orderId: id,
        ...req.body,
      });

      const order = await orderService.updateOrderStatus(validatedData);

      const response: ApiResponse = {
        success: true,
        data: order,
        message: 'Order status updated successfully',
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Failed to update order status',
      };
      res.status(400).json(response);
    }
  }
}

export const orderController = new OrderController();
