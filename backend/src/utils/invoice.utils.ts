import { Order } from '../models/order.model';

/**
 * Generate invoice PDF (mock implementation)
 * In production, use a library like pdfkit or puppeteer
 */
export const generateInvoicePDF = async (order: Order): Promise<Buffer> => {
  // Mock PDF generation - in production, use pdfkit or similar
  const invoiceContent = generateInvoiceHTML(order);
  return Buffer.from(invoiceContent, 'utf-8');
};

/**
 * Generate invoice HTML
 */
export const generateInvoiceHTML = (order: Order): string => {
  const itemsHTML = order.items
    .map(
      (item) => `
    <tr>
      <td>${item.productName}</td>
      <td>${item.quantity}</td>
      <td>$${item.price.toFixed(2)}</td>
      <td>$${item.subtotal.toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice #${order.orderNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .invoice-details { margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f2f2f2; }
    .totals { text-align: right; }
    .totals td { font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h1>INVOICE</h1>
    <p>FreshRoute E-commerce Platform</p>
  </div>
  
  <div class="invoice-details">
    <p><strong>Invoice Number:</strong> ${order.orderNumber}</p>
    <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
    <p><strong>Order Status:</strong> ${order.status.toUpperCase()}</p>
  </div>

  <h3>Shipping Address</h3>
  <p>
    ${order.shippingAddress.fullName}<br>
    ${order.shippingAddress.addressLine1}<br>
    ${order.shippingAddress.addressLine2 ? order.shippingAddress.addressLine2 + '<br>' : ''}
    ${order.shippingAddress.city}, ${order.shippingAddress.province}<br>
    ${order.shippingAddress.country}
  </p>

  <h3>Order Items</h3>
  <table>
    <thead>
      <tr>
        <th>Product</th>
        <th>Quantity</th>
        <th>Price</th>
        <th>Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHTML}
    </tbody>
  </table>

  <table class="totals">
    <tr>
      <td>Subtotal:</td>
      <td>$${order.subtotal.toFixed(2)}</td>
    </tr>
    ${
      order.discount > 0
        ? `
    <tr>
      <td>Discount:</td>
      <td>-$${order.discount.toFixed(2)}</td>
    </tr>
    `
        : ''
    }
    <tr>
      <td>Tax:</td>
      <td>$${order.tax.toFixed(2)}</td>
    </tr>
    <tr>
      <td>Shipping:</td>
      <td>$${order.shipping.toFixed(2)}</td>
    </tr>
    <tr style="font-size: 1.2em; border-top: 2px solid #333;">
      <td>Total:</td>
      <td>${order.currency} $${order.total.toFixed(2)}</td>
    </tr>
  </table>

  <div style="margin-top: 40px; text-align: center; color: #666;">
    <p>Thank you for your business!</p>
    <p>For questions about this invoice, please contact support@freshroute.com</p>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Generate invoice number
 */
export const generateInvoiceNumber = (orderId: string): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const shortId = orderId.substring(0, 8).toUpperCase();
  return `INV-${year}${month}${day}-${shortId}`;
};
