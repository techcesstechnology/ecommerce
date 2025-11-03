import { z } from 'zod';
import { Currency } from '../types';

export const addToCartSchema = z.object({
  userId: z.string().min(1),
  productId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  currency: z.nativeEnum(Currency),
  imageUrl: z.string().url().optional(),
});

export const updateCartItemSchema = z.object({
  userId: z.string().min(1),
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const removeFromCartSchema = z.object({
  userId: z.string().min(1),
  productId: z.string().min(1),
});

export const getCartSchema = z.object({
  userId: z.string().min(1),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type RemoveFromCartInput = z.infer<typeof removeFromCartSchema>;
export type GetCartInput = z.infer<typeof getCartSchema>;
