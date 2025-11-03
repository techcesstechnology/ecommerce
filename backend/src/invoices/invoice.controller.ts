import { Request, Response } from 'express';
import { invoiceService } from './invoice.service';
import { orderService } from '../orders/order.service';
import { ApiResponse } from '../types';

export class InvoiceController {
  async generateInvoice(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { userId } = req.query;

      if (!userId) {
        const response: ApiResponse = {
          success: false,
          error: 'User ID is required',
        };
        res.status(400).json(response);
        return;
      }

      const order = await orderService.getOrder(id, userId as string);

      if (!order) {
        const response: ApiResponse = {
          success: false,
          error: 'Order not found',
        };
        res.status(404).json(response);
        return;
      }

      const pdfDoc = invoiceService.generateInvoicePDF(order);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=invoice-${order.id}.pdf`
      );

      pdfDoc.pipe(res);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Failed to generate invoice',
      };
      res.status(400).json(response);
    }
  }
}

export const invoiceController = new InvoiceController();
