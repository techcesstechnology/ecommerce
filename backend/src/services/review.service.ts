import { AppDataSource } from '../config/database.config';
import { Review } from '../models/review.entity';
import { Product } from '../models/product.entity';
import { Order } from '../models/order.entity';
import { AppError } from '../utils/errors';
import { Repository } from 'typeorm';

export interface CreateReviewDto {
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  comment?: string;
}

export interface UpdateReviewDto {
  rating?: number;
  title?: string;
  comment?: string;
}

export class ReviewService {
  private reviewRepository: Repository<Review>;
  private productRepository: Repository<Product>;
  private orderRepository: Repository<Order>;

  constructor() {
    this.reviewRepository = AppDataSource.getRepository(Review);
    this.productRepository = AppDataSource.getRepository(Product);
    this.orderRepository = AppDataSource.getRepository(Order);
  }

  async createReview(data: CreateReviewDto): Promise<Review> {
    const { productId, userId, rating, title, comment } = data;

    if (rating < 1 || rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const existingReview = await this.reviewRepository.findOne({
      where: { productId, userId },
    });

    if (existingReview) {
      throw new AppError('You have already reviewed this product', 400);
    }

    const hasOrder = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.userId = :userId', { userId })
      .andWhere("order.items::text LIKE :productId", { productId: `%${productId}%` })
      .andWhere('order.status IN (:...statuses)', { statuses: ['delivered', 'completed'] })
      .getOne();

    const review = this.reviewRepository.create({
      productId,
      userId,
      rating,
      title,
      comment,
      verifiedPurchase: !!hasOrder,
      isApproved: true,
    });

    await this.reviewRepository.save(review);

    await this.updateProductRating(productId);

    return review;
  }

  async getReviewsByProduct(
    productId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ reviews: Review[]; total: number; averageRating: number }> {
    const skip = (page - 1) * limit;

    const [reviews, total] = await this.reviewRepository.findAndCount({
      where: { productId, isApproved: true },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    return {
      reviews,
      total,
      averageRating: product ? Number(product.averageRating) : 0,
    };
  }

  async getReviewsByUser(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ reviews: Review[]; total: number }> {
    const skip = (page - 1) * limit;

    const [reviews, total] = await this.reviewRepository.findAndCount({
      where: { userId },
      relations: ['product'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { reviews, total };
  }

  async getReviewById(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['product', 'user'],
    });

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    return review;
  }

  async updateReview(id: string, userId: string, data: UpdateReviewDto): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
    });

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    if (review.userId !== userId) {
      throw new AppError('You can only update your own reviews', 403);
    }

    if (data.rating !== undefined) {
      if (data.rating < 1 || data.rating > 5) {
        throw new AppError('Rating must be between 1 and 5', 400);
      }
      review.rating = data.rating;
    }

    if (data.title !== undefined) {
      review.title = data.title;
    }

    if (data.comment !== undefined) {
      review.comment = data.comment;
    }

    await this.reviewRepository.save(review);

    await this.updateProductRating(review.productId);

    return review;
  }

  async deleteReview(id: string, userId: string): Promise<void> {
    const review = await this.reviewRepository.findOne({
      where: { id },
    });

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    if (review.userId !== userId) {
      throw new AppError('You can only delete your own reviews', 403);
    }

    const productId = review.productId;

    await this.reviewRepository.remove(review);

    await this.updateProductRating(productId);
  }

  async markHelpful(reviewId: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    review.helpfulCount += 1;
    await this.reviewRepository.save(review);

    return review;
  }

  private async updateProductRating(productId: string): Promise<void> {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'averageRating')
      .addSelect('COUNT(review.id)', 'reviewCount')
      .where('review.productId = :productId', { productId })
      .andWhere('review.isApproved = :isApproved', { isApproved: true })
      .getRawOne();

    const averageRating = result.averageRating ? parseFloat(result.averageRating) : 0;
    const reviewCount = result.reviewCount ? parseInt(result.reviewCount, 10) : 0;

    await this.productRepository.update(productId, {
      averageRating: parseFloat(averageRating.toFixed(2)),
      reviewCount,
    });
  }

  async getProductRatingSummary(productId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { rating: number; count: number }[];
  }> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const distribution = await this.reviewRepository
      .createQueryBuilder('review')
      .select('review.rating', 'rating')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.productId = :productId', { productId })
      .andWhere('review.isApproved = :isApproved', { isApproved: true })
      .groupBy('review.rating')
      .orderBy('review.rating', 'DESC')
      .getRawMany();

    const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => {
      const found = distribution.find((d) => parseInt(d.rating, 10) === rating);
      return {
        rating,
        count: found ? parseInt(found.count, 10) : 0,
      };
    });

    return {
      averageRating: Number(product.averageRating),
      totalReviews: product.reviewCount,
      ratingDistribution,
    };
  }
}
