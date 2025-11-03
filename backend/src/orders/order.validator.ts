import { z } from 'zod';
import { Currency, OrderStatus, PaymentMethod } from '../types';

const shippingAddressSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().min(1),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
});

export const createOrderSchema = z.object({
  userId: z.string().min(1),
  currency: z.nativeEnum(Currency),
  paymentMethod: z.nativeEnum(PaymentMethod),
  shippingAddress: shippingAddressSchema,
  notes: z.string().optional(),
});

export const listOrdersSchema = z.object({
  userId: z.string().min(1),
  status: z.nativeEnum(OrderStatus).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});

export const getOrderSchema = z.object({
  orderId: z.string().min(1),
  userId: z.string().min(1),
});

export const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1),
  status: z.nativeEnum(OrderStatus),
  trackingNumber: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type ListOrdersInput = z.infer<typeof listOrdersSchema>;
export type GetOrderInput = z.infer<typeof getOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
