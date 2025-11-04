import { Order } from '../models/order.model';
import { Cart } from '../models/cart.model';

export interface EmailNotification {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email notification (mock implementation)
 * In production, integrate with services like SendGrid, AWS SES, or similar
 */
export const sendEmail = async (notification: EmailNotification): Promise<boolean> => {
  // Mock implementation - log email details
  // eslint-disable-next-line no-console
  console.log('Sending email:', {
    to: notification.to,
    subject: notification.subject,
  });
  // In production, integrate with email service
  return true;
};

/**
 * Send order confirmation email
 */
export const sendOrderConfirmation = async (
  order: Order,
  customerEmail: string
): Promise<boolean> => {
  const notification: EmailNotification = {
    to: customerEmail,
    subject: `Order Confirmation - ${order.orderNumber}`,
    html: `
      <h1>Thank you for your order!</h1>
      <p>Your order #${order.orderNumber} has been confirmed.</p>
      <h3>Order Details:</h3>
      <ul>
        ${order.items.map((item) => `<li>${item.productName} x ${item.quantity} - $${item.subtotal.toFixed(2)}</li>`).join('')}
      </ul>
      <p><strong>Total: ${order.currency} $${order.total.toFixed(2)}</strong></p>
      <p>We'll send you another email when your order ships.</p>
    `,
  };

  return sendEmail(notification);
};

/**
 * Send order status update email
 */
export const sendOrderStatusUpdate = async (
  order: Order,
  customerEmail: string
): Promise<boolean> => {
  const statusMessages: Record<string, string> = {
    processing: 'Your order is being processed',
    shipped: 'Your order has been shipped',
    delivered: 'Your order has been delivered',
    cancelled: 'Your order has been cancelled',
  };

  const message = statusMessages[order.status] || `Your order status: ${order.status}`;

  const notification: EmailNotification = {
    to: customerEmail,
    subject: `Order Update - ${order.orderNumber}`,
    html: `
      <h1>${message}</h1>
      <p>Order #${order.orderNumber}</p>
      ${order.trackingNumber ? `<p>Tracking Number: ${order.trackingNumber}</p>` : ''}
      ${order.estimatedDelivery ? `<p>Estimated Delivery: ${new Date(order.estimatedDelivery).toLocaleDateString()}</p>` : ''}
    `,
  };

  return sendEmail(notification);
};

/**
 * Send cart sharing email
 */
export const sendCartShareEmail = async (
  cart: Cart,
  recipientEmail: string,
  message?: string
): Promise<boolean> => {
  const notification: EmailNotification = {
    to: recipientEmail,
    subject: 'Someone shared their cart with you',
    html: `
      <h1>Shopping Cart Shared</h1>
      ${message ? `<p>${message}</p>` : ''}
      <h3>Cart Items:</h3>
      <ul>
        ${cart.items.map((item) => `<li>${item.productName} x ${item.quantity} - $${item.subtotal.toFixed(2)}</li>`).join('')}
      </ul>
      <p><strong>Total: ${cart.currency} $${cart.total.toFixed(2)}</strong></p>
      <p>Click the link below to view the cart:</p>
      <a href="${process.env.FRONTEND_URL}/cart/shared/${cart.id}">View Cart</a>
    `,
  };

  return sendEmail(notification);
};

/**
 * Send abandoned cart reminder
 */
export const sendAbandonedCartReminder = async (
  cart: Cart,
  customerEmail: string
): Promise<boolean> => {
  const notification: EmailNotification = {
    to: customerEmail,
    subject: 'You left items in your cart',
    html: `
      <h1>Don't forget your items!</h1>
      <p>You have ${cart.items.length} item(s) waiting in your cart.</p>
      <h3>Cart Items:</h3>
      <ul>
        ${cart.items.map((item) => `<li>${item.productName} x ${item.quantity}</li>`).join('')}
      </ul>
      <p><strong>Total: ${cart.currency} $${cart.total.toFixed(2)}</strong></p>
      <a href="${process.env.FRONTEND_URL}/cart">Complete Your Purchase</a>
    `,
  };

  return sendEmail(notification);
};

/**
 * Send SMS notification (mock implementation)
 */
export const sendSMS = async (phone: string, message: string): Promise<boolean> => {
  // Mock implementation
  // eslint-disable-next-line no-console
  console.log('Sending SMS:', {
    to: phone,
    message,
  });
  // In production, integrate with SMS service like Twilio
  return true;
};

/**
 * Send order tracking SMS
 */
export const sendTrackingSMS = async (
  phone: string,
  orderNumber: string,
  trackingNumber: string
): Promise<boolean> => {
  const message = `Your order ${orderNumber} has been shipped. Track it here: ${trackingNumber}`;
  return sendSMS(phone, message);
};
