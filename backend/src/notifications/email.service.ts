import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../config';
import { Order, Payment } from '../types';
import { generateOrderConfirmationEmail } from './templates/order-confirmation';
import { generatePaymentReceiptEmail } from './templates/payment-receipt';

export class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.smtp.host,
      port: config.email.smtp.port,
      secure: false,
      auth: {
        user: config.email.smtp.user,
        pass: config.email.smtp.password,
      },
    });
  }

  async sendOrderConfirmation(order: Order): Promise<void> {
    try {
      const html = generateOrderConfirmationEmail(order);

      await this.transporter.sendMail({
        from: config.email.from,
        to: order.shippingAddress.phone, // In production, use actual email
        subject: `Order Confirmation - ${order.id}`,
        html,
      });

      console.log(`Order confirmation email sent for order ${order.id}`);
    } catch (error) {
      console.error('Failed to send order confirmation email:', error);
    }
  }

  async sendOrderStatusUpdate(order: Order): Promise<void> {
    try {
      const statusMessages: Record<string, string> = {
        CONFIRMED: 'Your order has been confirmed and is being prepared.',
        PROCESSING: 'Your order is being processed.',
        SHIPPED: `Your order has been shipped. Tracking number: ${order.trackingNumber}`,
        DELIVERED: 'Your order has been delivered. Thank you for shopping with us!',
        CANCELLED: 'Your order has been cancelled.',
      };

      const message = statusMessages[order.status] || 'Your order status has been updated.';

      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order Status Update</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #FF9800; color: white; padding: 20px; text-align: center;">
    <h1 style="margin: 0;">Order Status Update</h1>
  </div>
  
  <div style="padding: 20px; background-color: #f9f9f9;">
    <div style="background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px;">
      <h2 style="color: #FF9800; margin-top: 0;">Order #${order.id}</h2>
      <p><strong>Status:</strong> ${order.status}</p>
      <p>${message}</p>
      ${order.trackingNumber ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ''}
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <p>Thank you for shopping with FreshRoute!</p>
    </div>
  </div>
</body>
</html>
      `;

      await this.transporter.sendMail({
        from: config.email.from,
        to: order.shippingAddress.phone,
        subject: `Order Status Update - ${order.id}`,
        html,
      });

      console.log(`Order status update email sent for order ${order.id}`);
    } catch (error) {
      console.error('Failed to send order status update email:', error);
    }
  }

  async sendPaymentReceipt(payment: Payment): Promise<void> {
    try {
      const html = generatePaymentReceiptEmail(payment);

      await this.transporter.sendMail({
        from: config.email.from,
        to: 'customer@example.com', // In production, get from order
        subject: `Payment Receipt - ${payment.id}`,
        html,
      });

      console.log(`Payment receipt email sent for payment ${payment.id}`);
    } catch (error) {
      console.error('Failed to send payment receipt email:', error);
    }
  }
}

export const emailService = new EmailService();
