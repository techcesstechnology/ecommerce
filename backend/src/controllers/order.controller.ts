import { Request, Response } from 'express';
import { orderService } from '../services/order.service';
import { paymentService } from '../services/payment.service';
import { formatResponse, formatError } from '../utils';
import { generateInvoiceHTML, generateInvoicePDF } from '../utils/invoice.utils';
import { sendOrderConfirmation, sendOrderStatusUpdate } from '../utils/notification.utils';
import { OrderFilters } from '../models/order.model';

/**
 * Create a new order
 */
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const orderData = req.body;

    const order = await orderService.createOrder(orderData, userId);

    // Process payment
    if (order.paymentMethod !== 'cash_on_delivery') {
      const paymentResult = await paymentService.processPayment({
        orderId: order.id,
        amount: order.total,
        currency: order.currency,
        provider: 'stripe', // Default provider
        paymentMethod: order.paymentMethod,
        paymentDetails: req.body.paymentDetails || {},
      });

      if (paymentResult.success) {
        await orderService.updateOrderStatus(order.id, { status: 'confirmed' });
        order.paymentStatus = 'completed';
      } else {
        await orderService.updateOrderStatus(order.id, { status: 'cancelled' });
        res.status(400).json(formatError('Payment failed', paymentResult.message));
        return;
      }
    }

    // Send confirmation email
    if (req.body.email) {
      await sendOrderConfirmation(order, req.body.email);
    }

    res.status(201).json(formatResponse(order, 'Order created successfully'));
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(400).json(formatError('Failed to create order', error));
  }
};

/**
 * Get order by ID
 */
export const getOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const order = await orderService.getOrderById(orderId);

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
 * Get orders with filters
 */
export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.headers['x-user-id'] as string;

    const filters: OrderFilters = {
      userId: (req.query.userId as string) || userId,
      status: req.query.status as
        | 'pending'
        | 'confirmed'
        | 'processing'
        | 'shipped'
        | 'delivered'
        | 'cancelled'
        | 'refunded',
      paymentStatus: req.query.paymentStatus as
        | 'pending'
        | 'processing'
        | 'completed'
        | 'failed'
        | 'refunded',
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
 * Update order status
 */
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const updateData = req.body;

    const order = await orderService.updateOrderStatus(orderId, updateData);

    // Send status update email
    if (req.body.email) {
      await sendOrderStatusUpdate(order, req.body.email);
    }

    res.status(200).json(formatResponse(order, 'Order status updated successfully'));
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(400).json(formatError('Failed to update order status', error));
  }
};

/**
 * Cancel order
 */
export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const order = await orderService.cancelOrder(orderId);

    res.status(200).json(formatResponse(order, 'Order cancelled successfully'));
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(400).json(formatError('Failed to cancel order', error));
  }
};

/**
 * Request refund
 */
export const requestRefund = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const refundData = {
      orderId,
      reason: req.body.reason,
      amount: req.body.amount,
      items: req.body.items,
    };

    const order = await orderService.requestRefund(refundData);
    res.status(200).json(formatResponse(order, 'Refund processed successfully'));
  } catch (error) {
    console.error('Error requesting refund:', error);
    res.status(400).json(formatError('Failed to process refund', error));
  }
};

/**
 * Request return
 */
export const requestReturn = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const returnData = {
      orderId,
      items: req.body.items,
      notes: req.body.notes,
    };

    const result = await orderService.requestReturn(returnData);
    res.status(200).json(formatResponse(result, 'Return request submitted successfully'));
  } catch (error) {
    console.error('Error requesting return:', error);
    res.status(400).json(formatError('Failed to submit return request', error));
  }
};

/**
 * Get order tracking
 */
export const getOrderTracking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const tracking = await orderService.getOrderTracking(orderId);

    res.status(200).json(formatResponse(tracking, 'Tracking information retrieved successfully'));
  } catch (error) {
    console.error('Error getting order tracking:', error);
    res.status(500).json(formatError('Failed to retrieve tracking information', error));
  }
};

/**
 * Get order invoice
 */
export const getOrderInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const order = await orderService.getOrderById(orderId);

    if (!order) {
      res.status(404).json(formatError('Order not found'));
      return;
    }

    const format = (req.query.format as string) || 'html';

    if (format === 'pdf') {
      const pdfBuffer = await generateInvoicePDF(order);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderNumber}.pdf`);
      res.send(pdfBuffer);
    } else {
      const html = generateInvoiceHTML(order);
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    }
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json(formatError('Failed to generate invoice', error));
  }
};
