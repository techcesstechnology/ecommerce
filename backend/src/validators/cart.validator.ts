import { body, param } from 'express-validator';

export const cartValidators = {
  addItem: [
    body('productId').isString().notEmpty().withMessage('Product ID is required'),
    body('quantity').isInt({ min: 1, max: 100 }).withMessage('Quantity must be between 1 and 100'),
  ],

  updateItem: [
    param('itemId').isString().notEmpty().withMessage('Item ID is required'),
    body('quantity').isInt({ min: 1, max: 100 }).withMessage('Quantity must be between 1 and 100'),
  ],

  removeItem: [param('itemId').isString().notEmpty().withMessage('Item ID is required')],

  applyDiscount: [body('code').isString().notEmpty().withMessage('Discount code is required')],

  saveForLater: [param('itemId').isString().notEmpty().withMessage('Item ID is required')],

  moveToCart: [param('itemId').isString().notEmpty().withMessage('Item ID is required')],

  shareCart: [
    body('email').isEmail().withMessage('Valid email is required'),
    body('message').optional().isString().withMessage('Message must be a string'),
  ],

  mergeCarts: [
    body('guestSessionId').isString().notEmpty().withMessage('Guest session ID is required'),
  ],
};
