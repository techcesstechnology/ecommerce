import { Response, NextFunction } from 'express';
import { CartService } from '../services/cart.service';
import { AppError } from '../utils/errors';
import { AuthRequest } from '../middleware/auth.middleware';

export class CartController {
  private cartService: CartService;

  constructor() {
    this.cartService = new CartService();
  }

  getCart = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const cart = await this.cartService.getCartByUserId(userId);

      res.status(200).json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  };

  addToCart = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { productId, quantity } = req.body;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!productId) {
        throw new AppError('Product ID is required', 400);
      }

      if (!quantity || quantity <= 0) {
        throw new AppError('Valid quantity is required', 400);
      }

      const cart = await this.cartService.addToCart(userId, productId, quantity);

      res.status(200).json({
        success: true,
        message: 'Item added to cart',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  };

  updateCartItem = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { productId } = req.params;
      const { quantity } = req.body;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (quantity === undefined || quantity < 0) {
        throw new AppError('Valid quantity is required', 400);
      }

      const cart = await this.cartService.updateCartItemQuantity(
        userId,
        productId,
        quantity
      );

      res.status(200).json({
        success: true,
        message: 'Cart item updated',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  };

  removeFromCart = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { productId } = req.params;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const cart = await this.cartService.removeFromCart(userId, productId);

      res.status(200).json({
        success: true,
        message: 'Item removed from cart',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  };

  clearCart = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      await this.cartService.clearCart(userId);

      res.status(200).json({
        success: true,
        message: 'Cart cleared successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  applyPromoCode = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { promoCode } = req.body;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!promoCode) {
        throw new AppError('Promo code is required', 400);
      }

      const cart = await this.cartService.applyPromoCode(userId, promoCode);

      res.status(200).json({
        success: true,
        message: 'Promo code applied successfully',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  };

  removePromoCode = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const cart = await this.cartService.removePromoCode(userId);

      res.status(200).json({
        success: true,
        message: 'Promo code removed',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  };
}
