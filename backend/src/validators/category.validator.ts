import { body, ValidationChain } from 'express-validator';

export const categoryValidators = {
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Category name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Category name must be between 2 and 100 characters'),
    body('slug')
      .optional()
      .trim()
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must not exceed 500 characters'),
    body('parentId').optional().isString().withMessage('Parent ID must be a string'),
    body('image').optional().isString().withMessage('Image must be a string'),
    body('status')
      .optional()
      .isIn(['active', 'inactive'])
      .withMessage('Status must be active or inactive'),
  ] as ValidationChain[],

  update: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Category name must be between 2 and 100 characters'),
    body('slug')
      .optional()
      .trim()
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must not exceed 500 characters'),
    body('parentId').optional().isString().withMessage('Parent ID must be a string'),
    body('image').optional().isString().withMessage('Image must be a string'),
    body('status')
      .optional()
      .isIn(['active', 'inactive'])
      .withMessage('Status must be active or inactive'),
  ] as ValidationChain[],
};
