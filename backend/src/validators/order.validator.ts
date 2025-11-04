import { body, param, query } from 'express-validator';

export const orderValidators = {
  create: [
    body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
    body('items.*.productId').isString().notEmpty().withMessage('Product ID is required'),
    body('items.*.quantity')
      .isInt({ min: 1, max: 100 })
      .withMessage('Quantity must be between 1 and 100'),
    body('items.*.price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('shippingAddress').isObject().withMessage('Shipping address is required'),
    body('shippingAddress.fullName').isString().notEmpty().withMessage('Full name is required'),
    body('shippingAddress.phone').isString().notEmpty().withMessage('Phone number is required'),
    body('shippingAddress.addressLine1')
      .isString()
      .notEmpty()
      .withMessage('Address line 1 is required'),
    body('shippingAddress.city').isString().notEmpty().withMessage('City is required'),
    body('shippingAddress.province').isString().notEmpty().withMessage('Province is required'),
    body('shippingAddress.country').isString().notEmpty().withMessage('Country is required'),
    body('paymentMethod')
      .isIn(['credit_card', 'debit_card', 'mobile_money', 'cash_on_delivery'])
      .withMessage('Invalid payment method'),
    body('discountCode').optional().isString().withMessage('Discount code must be a string'),
    body('notes').optional().isString().withMessage('Notes must be a string'),
  ],

  getOrders: [
    query('userId').optional().isString().withMessage('User ID must be a string'),
    query('status')
      .optional()
      .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
      .withMessage('Invalid order status'),
    query('paymentStatus')
      .optional()
      .isIn(['pending', 'processing', 'completed', 'failed', 'refunded'])
      .withMessage('Invalid payment status'),
    query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('sortBy').optional().isString().withMessage('Sort by must be a string'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc'),
  ],

  getOrder: [param('orderId').isString().notEmpty().withMessage('Order ID is required')],

  updateStatus: [
    param('orderId').isString().notEmpty().withMessage('Order ID is required'),
    body('status')
      .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
      .withMessage('Invalid order status'),
    body('trackingNumber').optional().isString().withMessage('Tracking number must be a string'),
    body('estimatedDelivery').optional().isISO8601().withMessage('Invalid estimated delivery date'),
  ],

  cancelOrder: [param('orderId').isString().notEmpty().withMessage('Order ID is required')],

  refund: [
    param('orderId').isString().notEmpty().withMessage('Order ID is required'),
    body('reason').isString().notEmpty().withMessage('Refund reason is required'),
    body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('items').optional().isArray().withMessage('Items must be an array'),
  ],

  return: [
    param('orderId').isString().notEmpty().withMessage('Order ID is required'),
    body('items').isArray({ min: 1 }).withMessage('Return must contain at least one item'),
    body('items.*.orderItemId').isString().notEmpty().withMessage('Order item ID is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
    body('items.*.reason').isString().notEmpty().withMessage('Return reason is required'),
    body('notes').optional().isString().withMessage('Notes must be a string'),
  ],

  tracking: [param('orderId').isString().notEmpty().withMessage('Order ID is required')],

  invoice: [
    param('orderId').isString().notEmpty().withMessage('Order ID is required'),
    query('format').optional().isIn(['html', 'pdf']).withMessage('Format must be html or pdf'),
  ],
};
