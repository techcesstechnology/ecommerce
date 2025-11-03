import { Request, Response } from 'express';
import { cartService } from './cart.service';
import {
  addToCartSchema,
  updateCartItemSchema,
  removeFromCartSchema,
  getCartSchema,
} from './cart.validator';
import { ApiResponse } from '../types';

export class CartController {
  async addToCart(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = addToCartSchema.parse(req.body);
      const cart = await cartService.addToCart(validatedData);

      const response: ApiResponse = {
        success: true,
        data: cart,
        message: 'Item added to cart successfully',
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Failed to add item to cart',
      };
      res.status(400).json(response);
    }
  }

  async updateCartItem(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = updateCartItemSchema.parse(req.body);
      const cart = await cartService.updateCartItem(validatedData);

      const response: ApiResponse = {
        success: true,
        data: cart,
        message: 'Cart item updated successfully',
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Failed to update cart item',
      };
      res.status(400).json(response);
    }
  }

  async removeFromCart(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = removeFromCartSchema.parse(req.body);
      const cart = await cartService.removeFromCart(validatedData);

      const response: ApiResponse = {
        success: true,
        data: cart,
        message: 'Item removed from cart successfully',
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Failed to remove item from cart',
      };
      res.status(400).json(response);
    }
  }

  async getCart(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.query;
      const validatedData = getCartSchema.parse({ userId });
      const cart = await cartService.getCart(validatedData.userId);

      const response: ApiResponse = {
        success: true,
        data: cart,
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Failed to get cart',
      };
      res.status(400).json(response);
    }
  }
}

export const cartController = new CartController();
