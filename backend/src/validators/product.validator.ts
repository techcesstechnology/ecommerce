import Joi from 'joi';
import { Currency, ProductStatus } from '../types/product.types';

const productImageSchema = Joi.object({
  url: Joi.string().uri().required(),
  thumbnailUrl: Joi.string().uri().required(),
  alt: Joi.string().allow('').default(''),
  order: Joi.number().integer().min(0).default(0)
});

const productPriceSchema = Joi.object({
  currency: Joi.string().valid(...Object.values(Currency)).required(),
  amount: Joi.number().min(0).required()
});

const productVariantSchema = Joi.object({
  name: Joi.string().required(),
  attributes: Joi.object().pattern(Joi.string(), Joi.string()).required(),
  sku: Joi.string().required(),
  price: Joi.array().items(productPriceSchema).min(1).required(),
  stock: Joi.number().integer().min(0).required(),
  images: Joi.array().items(productImageSchema).optional()
});

export const createProductSchema = Joi.object({
  name: Joi.string().min(3).max(200).required(),
  description: Joi.string().min(10).max(5000).required(),
  category: Joi.string().required(),
  subcategory: Joi.string().optional(),
  supplier: Joi.string().optional(),
  prices: Joi.array().items(productPriceSchema).min(1).required(),
  images: Joi.array().items(productImageSchema).optional(),
  variants: Joi.array().items(productVariantSchema).optional(),
  stock: Joi.number().integer().min(0).required(),
  tags: Joi.array().items(Joi.string()).optional(),
  metadata: Joi.object().optional()
});

export const updateProductSchema = Joi.object({
  name: Joi.string().min(3).max(200).optional(),
  description: Joi.string().min(10).max(5000).optional(),
  category: Joi.string().optional(),
  subcategory: Joi.string().optional(),
  supplier: Joi.string().optional(),
  prices: Joi.array().items(productPriceSchema).min(1).optional(),
  images: Joi.array().items(productImageSchema).optional(),
  variants: Joi.array().items(productVariantSchema).optional(),
  stock: Joi.number().integer().min(0).optional(),
  status: Joi.string().valid(...Object.values(ProductStatus)).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  metadata: Joi.object().optional()
}).min(1); // At least one field must be present

export const productFilterSchema = Joi.object({
  category: Joi.string().optional(),
  subcategory: Joi.string().optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  currency: Joi.string().valid(...Object.values(Currency)).optional(),
  status: Joi.string().valid(...Object.values(ProductStatus)).optional(),
  supplier: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  search: Joi.string().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().valid('price', 'name', 'createdAt', 'updatedAt').optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

export const createCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).optional(),
  parentId: Joi.string().optional(),
  image: Joi.string().uri().optional(),
  order: Joi.number().integer().min(0).optional()
});

export const productIdSchema = Joi.object({
  id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
    .messages({
      'string.pattern.base': 'Invalid product ID format'
    })
});
