import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database.config';
import { Promotion, PromotionType } from '../models/promotion.entity';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/errors';
import { logger } from '../services/logger.service';

export interface CreatePromotionDto {
  code: string;
  name: string;
  description?: string;
  type: PromotionType;
  value: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  startDate: Date;
  endDate: Date;
  usageLimit?: number;
  isActive?: boolean;
  applicableCategories?: string[];
  applicableProducts?: string[];
}

export interface UpdatePromotionDto {
  name?: string;
  description?: string;
  value?: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  startDate?: Date;
  endDate?: Date;
  usageLimit?: number;
  isActive?: boolean;
  applicableCategories?: string[];
  applicableProducts?: string[];
}

export interface ValidatePromoCodeResult {
  valid: boolean;
  promotion?: Promotion;
  error?: string;
}

export class PromotionService {
  private promotionRepository: Repository<Promotion>;

  constructor() {
    this.promotionRepository = AppDataSource.getRepository(Promotion);
  }

  async createPromotion(data: CreatePromotionDto): Promise<Promotion> {
    const existingPromo = await this.promotionRepository.findOne({
      where: { code: data.code.toUpperCase() },
    });

    if (existingPromo) {
      throw new ConflictError('Promo code already exists');
    }

    if (new Date(data.startDate) >= new Date(data.endDate)) {
      throw new BadRequestError('End date must be after start date');
    }

    const promotion = this.promotionRepository.create({
      ...data,
      code: data.code.toUpperCase(),
    });

    return await this.promotionRepository.save(promotion);
  }

  async getPromotionById(id: string): Promise<Promotion> {
    const promotion = await this.promotionRepository.findOne({
      where: { id },
    });

    if (!promotion) {
      throw new NotFoundError('Promotion not found');
    }

    return promotion;
  }

  async getPromotionByCode(code: string): Promise<Promotion> {
    const promotion = await this.promotionRepository.findOne({
      where: { code: code.toUpperCase() },
    });

    if (!promotion) {
      throw new NotFoundError('Promotion not found');
    }

    return promotion;
  }

  async getAllPromotions(filters?: {
    isActive?: boolean;
    type?: PromotionType;
    current?: boolean;
  }): Promise<Promotion[]> {
    const query = this.promotionRepository.createQueryBuilder('promotion');

    if (filters?.isActive !== undefined) {
      query.andWhere('promotion.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters?.type) {
      query.andWhere('promotion.type = :type', { type: filters.type });
    }

    if (filters?.current) {
      const now = new Date();
      query
        .andWhere('promotion.startDate <= :now', { now })
        .andWhere('promotion.endDate >= :now', { now });
    }

    return await query.orderBy('promotion.createdAt', 'DESC').getMany();
  }

  async updatePromotion(id: string, data: UpdatePromotionDto): Promise<Promotion> {
    const promotion = await this.promotionRepository.findOne({
      where: { id },
    });

    if (!promotion) {
      throw new NotFoundError('Promotion not found');
    }

    if (data.startDate && data.endDate && new Date(data.startDate) >= new Date(data.endDate)) {
      throw new BadRequestError('End date must be after start date');
    }

    Object.assign(promotion, data);
    return await this.promotionRepository.save(promotion);
  }

  async deletePromotion(id: string): Promise<void> {
    const promotion = await this.promotionRepository.findOne({
      where: { id },
    });

    if (!promotion) {
      throw new NotFoundError('Promotion not found');
    }

    await this.promotionRepository.remove(promotion);
  }

  async validatePromoCode(
    code: string,
    cartTotal: number,
    categoryIds?: string[],
    productIds?: string[]
  ): Promise<ValidatePromoCodeResult> {
    try {
      const promotion = await this.getPromotionByCode(code);

      if (!promotion) {
        return { valid: false, error: 'Invalid promo code' };
      }

      if (!promotion.isActive) {
        return { valid: false, error: 'Promo code is inactive' };
      }

      const now = new Date();
      if (now < promotion.startDate) {
        return { valid: false, error: 'Promo code is not yet valid' };
      }

      if (now > promotion.endDate) {
        return { valid: false, error: 'Promo code has expired' };
      }

      if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
        return { valid: false, error: 'Promo code usage limit reached' };
      }

      if (promotion.minPurchaseAmount && cartTotal < promotion.minPurchaseAmount) {
        return {
          valid: false,
          error: `Minimum purchase amount of ${promotion.minPurchaseAmount} required`,
        };
      }

      if (promotion.applicableCategories && promotion.applicableCategories.length > 0) {
        if (!categoryIds || categoryIds.length === 0) {
          return { valid: false, error: 'No applicable categories in cart' };
        }

        const hasApplicableCategory = categoryIds.some((catId) =>
          promotion.applicableCategories?.includes(catId)
        );

        if (!hasApplicableCategory) {
          return { valid: false, error: 'Promo code not applicable to cart items' };
        }
      }

      if (promotion.applicableProducts && promotion.applicableProducts.length > 0) {
        if (!productIds || productIds.length === 0) {
          return { valid: false, error: 'No applicable products in cart' };
        }

        const hasApplicableProduct = productIds.some((prodId) =>
          promotion.applicableProducts?.includes(prodId)
        );

        if (!hasApplicableProduct) {
          return { valid: false, error: 'Promo code not applicable to cart items' };
        }
      }

      return { valid: true, promotion };
    } catch (error) {
      console.error('Error validating promo code:', error);
      return { valid: false, error: 'Failed to validate promo code' };
    }
  }

  async incrementUsageCount(id: string): Promise<Promotion> {
    const promotion = await this.promotionRepository.findOne({
      where: { id },
    });

    if (!promotion) {
      throw new NotFoundError('Promotion not found');
    }

    promotion.usageCount += 1;
    return await this.promotionRepository.save(promotion);
  }

  async decrementUsageCount(id: string): Promise<Promotion> {
    const promotion = await this.promotionRepository.findOne({
      where: { id },
    });

    if (!promotion) {
      throw new NotFoundError('Promotion not found');
    }

    if (promotion.usageCount > 0) {
      promotion.usageCount -= 1;
      return await this.promotionRepository.save(promotion);
    }

    return promotion;
  }

  calculateDiscount(promotion: Promotion, cartTotal: number): number {
    let discount = 0;

    switch (promotion.type) {
      case 'percentage':
        discount = (cartTotal * promotion.value) / 100;
        break;

      case 'fixed':
        discount = promotion.value;
        break;

      case 'free_shipping':
        discount = 0;
        break;

      case 'bogo':
        discount = 0;
        break;

      default:
        discount = 0;
    }

    if (promotion.maxDiscountAmount && discount > promotion.maxDiscountAmount) {
      discount = promotion.maxDiscountAmount;
    }

    return Math.min(discount, cartTotal);
  }
}

export const promotionService = new PromotionService();
