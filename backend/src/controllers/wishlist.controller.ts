import { Response, NextFunction } from 'express';
import { WishlistService } from '../services/wishlist.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../utils/errors';

export class WishlistController {
  private wishlistService: WishlistService;

  constructor() {
    this.wishlistService = new WishlistService();
  }

  getWishlist = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const wishlist = await this.wishlistService.getWishlistByUserId(userId);

      res.status(200).json({
        success: true,
        data: wishlist,
      });
    } catch (error) {
      next(error);
    }
  };

  addToWishlist = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { productId, notes } = req.body;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!productId) {
        throw new AppError('Product ID is required', 400);
      }

      const wishlist = await this.wishlistService.addToWishlist(userId, productId, notes);

      res.status(200).json({
        success: true,
        message: 'Item added to wishlist',
        data: wishlist,
      });
    } catch (error) {
      next(error);
    }
  };

  removeFromWishlist = async (
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

      const wishlist = await this.wishlistService.removeFromWishlist(userId, productId);

      res.status(200).json({
        success: true,
        message: 'Item removed from wishlist',
        data: wishlist,
      });
    } catch (error) {
      next(error);
    }
  };

  updateWishlistItem = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { productId } = req.params;
      const { notes } = req.body;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const wishlist = await this.wishlistService.updateWishlistItem(
        userId,
        productId,
        notes
      );

      res.status(200).json({
        success: true,
        message: 'Wishlist item updated',
        data: wishlist,
      });
    } catch (error) {
      next(error);
    }
  };

  clearWishlist = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      await this.wishlistService.clearWishlist(userId);

      res.status(200).json({
        success: true,
        message: 'Wishlist cleared successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  updateWishlistSettings = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { name, isPublic } = req.body;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const wishlist = await this.wishlistService.updateWishlistSettings(
        userId,
        name,
        isPublic
      );

      res.status(200).json({
        success: true,
        message: 'Wishlist settings updated',
        data: wishlist,
      });
    } catch (error) {
      next(error);
    }
  };

  checkProductInWishlist = async (
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

      const inWishlist = await this.wishlistService.checkProductInWishlist(
        userId,
        productId
      );

      res.status(200).json({
        success: true,
        data: { inWishlist },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const wishlistController = new WishlistController();
