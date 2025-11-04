import { Request, Response } from 'express';
import { orderService } from '../services/order.service';
import { formatResponse, formatError } from '../utils';
import { OrderFilters } from '../models/order.model';

/**
 * Get all orders with filters and pagination
 */
export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters: OrderFilters = {
      status: req.query.status as string,
      paymentStatus: req.query.paymentStatus as string,
      userId: req.query.userId as string,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
    };

    const result = await orderService.getOrders(filters);
    res.status(200).json(formatResponse(result, 'Orders retrieved successfully'));
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json(formatError('Failed to retrieve orders', error));
  }
};

/**
 * Get a single order by ID
 */
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(id);

    if (!order) {
      res.status(404).json(formatError('Order not found'));
      return;
    }

    res.status(200).json(formatResponse(order, 'Order retrieved successfully'));
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json(formatError('Failed to retrieve order', error));
  }
};

/**
 * Get an order by order number
 */
export const getOrderByNumber = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderNumber } = req.params;
    const order = await orderService.getOrderByNumber(orderNumber);

    if (!order) {
      res.status(404).json(formatError('Order not found'));
      return;
    }

    res.status(200).json(formatResponse(order, 'Order retrieved successfully'));
  } catch (error) {
    console.error('Error getting order by number:', error);
    res.status(500).json(formatError('Failed to retrieve order', error));
  }
};

/**
 * Create a new order
 */
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await orderService.createOrder(req.body);
    res.status(201).json(formatResponse(order, 'Order created successfully'));
  } catch (error) {
    console.error('Error creating order:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
    res.status(400).json(formatError(errorMessage, error));
  }
};

/**
 * Update an order
 */
export const updateOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await orderService.updateOrder(id, req.body);

    if (!order) {
      res.status(404).json(formatError('Order not found'));
      return;
    }

    res.status(200).json(formatResponse(order, 'Order updated successfully'));
  } catch (error) {
    console.error('Error updating order:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update order';
    res.status(400).json(formatError(errorMessage, error));
  }
};

/**
 * Cancel an order
 */
export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await orderService.cancelOrder(id);

    if (!order) {
      res.status(404).json(formatError('Order not found'));
      return;
    }

    res.status(200).json(formatResponse(order, 'Order cancelled successfully'));
  } catch (error) {
    console.error('Error cancelling order:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to cancel order';
    res.status(400).json(formatError(errorMessage, error));
  }
};

/**
 * Get orders by user
 */
export const getOrdersByUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const orders = await orderService.getOrdersByUser(userId);
    res.status(200).json(formatResponse(orders, 'Orders retrieved successfully'));
  } catch (error) {
    console.error('Error getting orders by user:', error);
    res.status(500).json(formatError('Failed to retrieve orders', error));
  }
};

/**
 * Get order statistics
 */
export const getOrderStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await orderService.getOrderStats();
    res.status(200).json(formatResponse(stats, 'Order statistics retrieved successfully'));
  } catch (error) {
    console.error('Error getting order statistics:', error);
    res.status(500).json(formatError('Failed to retrieve order statistics', error));
  }
};
