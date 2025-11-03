import { Payment } from '../../types';

export function generatePaymentReceiptEmail(payment: Payment): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Payment Receipt</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #2196F3; color: white; padding: 20px; text-align: center;">
    <h1 style="margin: 0;">Payment Received</h1>
  </div>
  
  <div style="padding: 20px; background-color: #f9f9f9;">
    <p>Thank you! Your payment has been successfully processed.</p>
    
    <div style="background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px;">
      <h2 style="color: #2196F3; margin-top: 0;">Payment Details</h2>
      <p><strong>Payment ID:</strong> ${payment.id}</p>
      <p><strong>Transaction ID:</strong> ${payment.transactionId || 'N/A'}</p>
      <p><strong>Order ID:</strong> ${payment.orderId}</p>
      <p><strong>Date:</strong> ${new Date(payment.createdAt).toLocaleString()}</p>
      <p><strong>Payment Method:</strong> ${payment.method}</p>
      <p><strong>Status:</strong> ${payment.status}</p>
    </div>

    <div style="background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px;">
      <div style="display: flex; justify-content: space-between; font-size: 24px; font-weight: bold; color: #2196F3;">
        <span>Amount Paid:</span>
        <span>${payment.currency} ${payment.amount.toFixed(2)}</span>
      </div>
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <p>This is your payment receipt for your records.</p>
      <p style="color: #666; font-size: 12px;">If you have any questions about this payment, please contact our support team.</p>
    </div>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>© 2024 FreshRoute. All rights reserved.</p>
  </div>
</body>
</html>
  `;
}
