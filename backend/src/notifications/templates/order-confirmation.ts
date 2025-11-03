import { Order } from '../../types';

export function generateOrderConfirmationEmail(order: Order): string {
  const itemsList = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${order.currency} ${item.price.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${order.currency} ${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
    <h1 style="margin: 0;">Order Confirmed!</h1>
  </div>
  
  <div style="padding: 20px; background-color: #f9f9f9;">
    <p>Thank you for your order! We've received your order and will process it shortly.</p>
    
    <div style="background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px;">
      <h2 style="color: #4CAF50; margin-top: 0;">Order Details</h2>
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
      <p><strong>Status:</strong> ${order.status}</p>
    </div>

    <div style="background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px;">
      <h3 style="margin-top: 0;">Shipping Address</h3>
      <p>
        ${order.shippingAddress.fullName}<br>
        ${order.shippingAddress.street}<br>
        ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}<br>
        ${order.shippingAddress.country}<br>
        Phone: ${order.shippingAddress.phone}
      </p>
    </div>

    <div style="background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px;">
      <h3 style="margin-top: 0;">Order Items</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f0f0f0;">
            <th style="padding: 10px; text-align: left;">Item</th>
            <th style="padding: 10px; text-align: center;">Qty</th>
            <th style="padding: 10px; text-align: right;">Price</th>
            <th style="padding: 10px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsList}
        </tbody>
      </table>
      
      <div style="margin-top: 20px; padding-top: 10px; border-top: 2px solid #eee;">
        <div style="display: flex; justify-content: space-between; padding: 5px 0;">
          <span>Subtotal:</span>
          <span>${order.currency} ${order.subtotal.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 5px 0;">
          <span>Tax:</span>
          <span>${order.currency} ${order.tax.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 5px 0;">
          <span>Shipping:</span>
          <span>${order.currency} ${order.shippingCost.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 18px; font-weight: bold; border-top: 2px solid #4CAF50;">
          <span>Total:</span>
          <span>${order.currency} ${order.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <p>Thank you for shopping with FreshRoute!</p>
      <p style="color: #666; font-size: 12px;">If you have any questions, please contact our support team.</p>
    </div>
  </div>
</body>
</html>
  `;
}
