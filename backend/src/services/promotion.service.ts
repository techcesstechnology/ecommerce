import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database.config';
import { Promotion, PromotionType } from '../models/promotion.entity';

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
    try {
      const existingPromo = await this.promotionRepository.findOne({
        where: { code: data.code.toUpperCase() },
      });

      if (existingPromo) {
        throw new Error('Promo code already exists');
      }

      const promotion = this.promotionRepository.create({
        ...data,
        code: data.code.toUpperCase(),
      });

      return await this.promotionRepository.save(promotion);
    } catch (error) {
      console.error('Error creating promotion:', error);
      throw error;
    }
  }

  async getPromotionById(id: string): Promise<Promotion | null> {
    try {
      return await this.promotionRepository.findOne({
        where: { id },
      });
    } catch (error) {
      console.error('Error fetching promotion:', error);
      throw new Error('Failed to fetch promotion');
    }
  }

  async getPromotionByCode(code: string): Promise<Promotion | null> {
    try {
      return await this.promotionRepository.findOne({
        where: { code: code.toUpperCase() },
      });
    } catch (error) {
      console.error('Error fetching promotion by code:', error);
      throw new Error('Failed to fetch promotion by code');
    }
  }

  async getAllPromotions(filters?: {
    isActive?: boolean;
    type?: PromotionType;
    current?: boolean;
  }): Promise<Promotion[]> {
    try {
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
    } catch (error) {
      console.error('Error fetching promotions:', error);
      throw new Error('Failed to fetch promotions');
    }
  }

  async updatePromotion(id: string, data: UpdatePromotionDto): Promise<Promotion> {
    try {
      const promotion = await this.promotionRepository.findOne({
        where: { id },
      });

      if (!promotion) {
        throw new Error('Promotion not found');
      }

      Object.assign(promotion, data);
      return await this.promotionRepository.save(promotion);
    } catch (error) {
      console.error('Error updating promotion:', error);
      throw error;
    }
  }

  async deletePromotion(id: string): Promise<void> {
    try {
      const promotion = await this.promotionRepository.findOne({
        where: { id },
      });

      if (!promotion) {
        throw new Error('Promotion not found');
      }

      await this.promotionRepository.remove(promotion);
    } catch (error) {
      console.error('Error deleting promotion:', error);
      throw error;
    }
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
    try {
      const promotion = await this.promotionRepository.findOne({
        where: { id },
      });

      if (!promotion) {
        throw new Error('Promotion not found');
      }

      promotion.usageCount += 1;
      return await this.promotionRepository.save(promotion);
    } catch (error) {
      console.error('Error incrementing usage count:', error);
      throw error;
    }
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
