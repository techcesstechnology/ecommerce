import { body, query, ValidationChain } from 'express-validator';

export const productValidators = {
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Product name is required')
      .isLength({ min: 3, max: 200 })
      .withMessage('Product name must be between 3 and 200 characters'),
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Product description is required')
      .isLength({ min: 10 })
      .withMessage('Product description must be at least 10 characters'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    body('comparePrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Compare price must be a non-negative number'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('sku')
      .trim()
      .notEmpty()
      .withMessage('SKU is required')
      .matches(/^[A-Z0-9-]+$/)
      .withMessage('SKU must contain only uppercase letters, numbers, and hyphens'),
    body('status')
      .optional()
      .isIn(['draft', 'published', 'archived'])
      .withMessage('Status must be draft, published, or archived'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('tags.*').optional().isString().withMessage('Each tag must be a string'),
    body('images').optional().isArray().withMessage('Images must be an array'),
    body('images.*').optional().isString().withMessage('Each image must be a string'),
    body('features').optional().isArray().withMessage('Features must be an array'),
    body('features.*').optional().isString().withMessage('Each feature must be a string'),
    body('specifications').optional().isObject().withMessage('Specifications must be an object'),
  ] as ValidationChain[],

  update: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 3, max: 200 })
      .withMessage('Product name must be between 3 and 200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 10 })
      .withMessage('Product description must be at least 10 characters'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('comparePrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Compare price must be a positive number'),
    body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('sku')
      .optional()
      .trim()
      .matches(/^[A-Z0-9-]+$/)
      .withMessage('SKU must contain only uppercase letters, numbers, and hyphens'),
    body('status')
      .optional()
      .isIn(['draft', 'published', 'archived'])
      .withMessage('Status must be draft, published, or archived'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('images').optional().isArray().withMessage('Images must be an array'),
    body('features').optional().isArray().withMessage('Features must be an array'),
    body('specifications').optional().isObject().withMessage('Specifications must be an object'),
  ] as ValidationChain[],

  updateStock: [
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  ] as ValidationChain[],

  filters: [
    query('category').optional().isString().withMessage('Category must be a string'),
    query('status')
      .optional()
      .isIn(['draft', 'published', 'archived'])
      .withMessage('Status must be draft, published, or archived'),
    query('minPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Min price must be a non-negative number'),
    query('maxPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Max price must be a non-negative number'),
    query('search').optional().isString().withMessage('Search must be a string'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('sortBy').optional().isString().withMessage('SortBy must be a string'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc'),
  ] as ValidationChain[],
};
