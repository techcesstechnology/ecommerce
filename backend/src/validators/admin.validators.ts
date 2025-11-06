import { body, param } from 'express-validator';

export const createProductValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').optional().trim(),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('categoryId').notEmpty().withMessage('Category ID is required'),
  body('stockQuantity').optional().isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),
  body('imageUrl').optional().trim().isURL().withMessage('Image URL must be valid'),
  body('unit').optional().trim(),
  body('weight').optional().isFloat({ min: 0 }).withMessage('Weight must be a positive number'),
  body('isOrganic').optional().isBoolean().withMessage('isOrganic must be boolean'),
  body('isFeatured').optional().isBoolean().withMessage('isFeatured must be boolean'),
];

export const updateProductValidation = [
  param('id').notEmpty().withMessage('Product ID is required'),
  body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
  body('description').optional().trim(),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('categoryId').optional().notEmpty().withMessage('Category ID cannot be empty'),
  body('stockQuantity').optional().isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),
  body('imageUrl').optional().trim().isURL().withMessage('Image URL must be valid'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
];

export const idParamValidation = [
  param('id').notEmpty().withMessage('ID parameter is required'),
];

export const createCategoryValidation = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('description').optional().trim(),
  body('icon').optional().trim(),
  body('color').optional().trim(),
  body('parentId').optional().trim(),
];

export const updateCategoryValidation = [
  param('id').notEmpty().withMessage('Category ID is required'),
  body('name').optional().trim().notEmpty().withMessage('Category name cannot be empty'),
  body('description').optional().trim(),
  body('icon').optional().trim(),
  body('color').optional().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
];

export const updateOrderStatusValidation = [
  param('id').notEmpty().withMessage('Order ID is required'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
];

export const updateUserRoleValidation = [
  param('id').notEmpty().withMessage('User ID is required'),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['customer', 'admin', 'vendor'])
    .withMessage('Invalid user role'),
];

export const createDeliverySlotValidation = [
  body('date').isISO8601().withMessage('Valid date is required'),
  body('startTime').trim().notEmpty().withMessage('Start time is required'),
  body('endTime').trim().notEmpty().withMessage('End time is required'),
  body('maxOrders').isInt({ min: 1 }).withMessage('Max orders must be at least 1'),
  body('deliveryFee').optional().isFloat({ min: 0 }).withMessage('Delivery fee must be non-negative'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
];

export const updateDeliverySlotValidation = [
  param('id').notEmpty().withMessage('Delivery slot ID is required'),
  body('startTime').optional().trim().notEmpty().withMessage('Start time cannot be empty'),
  body('endTime').optional().trim().notEmpty().withMessage('End time cannot be empty'),
  body('maxOrders').optional().isInt({ min: 1 }).withMessage('Max orders must be at least 1'),
  body('deliveryFee').optional().isFloat({ min: 0 }).withMessage('Delivery fee must be non-negative'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
];

export const createPromotionValidation = [
  body('code').trim().notEmpty().withMessage('Promo code is required'),
  body('name').trim().notEmpty().withMessage('Promotion name is required'),
  body('description').optional().trim(),
  body('type')
    .notEmpty()
    .withMessage('Promotion type is required')
    .isIn(['percentage', 'fixed', 'bogo', 'free_shipping'])
    .withMessage('Invalid promotion type'),
  body('value').isFloat({ min: 0 }).withMessage('Value must be a positive number'),
  body('minPurchaseAmount').optional().isFloat({ min: 0 }).withMessage('Minimum purchase amount must be non-negative'),
  body('maxDiscountAmount').optional().isFloat({ min: 0 }).withMessage('Max discount amount must be non-negative'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('usageLimit').optional().isInt({ min: 1 }).withMessage('Usage limit must be at least 1'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  body('applicableCategories').optional().isArray().withMessage('Applicable categories must be an array'),
  body('applicableProducts').optional().isArray().withMessage('Applicable products must be an array'),
];

export const updatePromotionValidation = [
  param('id').notEmpty().withMessage('Promotion ID is required'),
  body('name').optional().trim().notEmpty().withMessage('Promotion name cannot be empty'),
  body('description').optional().trim(),
  body('value').optional().isFloat({ min: 0 }).withMessage('Value must be a positive number'),
  body('minPurchaseAmount').optional().isFloat({ min: 0 }).withMessage('Minimum purchase amount must be non-negative'),
  body('maxDiscountAmount').optional().isFloat({ min: 0 }).withMessage('Max discount amount must be non-negative'),
  body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date is required'),
  body('usageLimit').optional().isInt({ min: 1 }).withMessage('Usage limit must be at least 1'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  body('applicableCategories').optional().isArray().withMessage('Applicable categories must be an array'),
  body('applicableProducts').optional().isArray().withMessage('Applicable products must be an array'),
];
