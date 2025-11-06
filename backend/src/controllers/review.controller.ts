import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/review.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../utils/errors';

export class ReviewController {
  private reviewService: ReviewService;

  constructor() {
    this.reviewService = new ReviewService();
  }

  createReview = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { productId, rating, title, comment } = req.body;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!productId || !rating) {
        throw new AppError('Product ID and rating are required', 400);
      }

      const review = await this.reviewService.createReview({
        productId,
        userId,
        rating,
        title,
        comment,
      });

      res.status(201).json({
        success: true,
        message: 'Review created successfully',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  };

  getReviewsByProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { productId } = req.params;
      const { page, limit } = req.query;

      const result = await this.reviewService.getReviewsByProduct(
        productId,
        page ? parseInt(page as string, 10) : 1,
        limit ? parseInt(limit as string, 10) : 10
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getReviewsByUser = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { page, limit } = req.query;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const result = await this.reviewService.getReviewsByUser(
        userId,
        page ? parseInt(page as string, 10) : 1,
        limit ? parseInt(limit as string, 10) : 10
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getReviewById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const review = await this.reviewService.getReviewById(id);

      res.status(200).json({
        success: true,
        data: review,
      });
    } catch (error) {
      next(error);
    }
  };

  updateReview = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      const { rating, title, comment } = req.body;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const review = await this.reviewService.updateReview(id, userId, {
        rating,
        title,
        comment,
      });

      res.status(200).json({
        success: true,
        message: 'Review updated successfully',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteReview = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      await this.reviewService.deleteReview(id, userId);

      res.status(200).json({
        success: true,
        message: 'Review deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  markHelpful = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const review = await this.reviewService.markHelpful(id);

      res.status(200).json({
        success: true,
        message: 'Review marked as helpful',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  };

  getProductRatingSummary = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { productId } = req.params;
      const summary = await this.reviewService.getProductRatingSummary(productId);

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const reviewController = new ReviewController();
