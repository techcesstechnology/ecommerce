import { AppDataSource } from '../config/database.config';
import { Wishlist } from '../models/wishlist.entity';
import { WishlistItem } from '../models/wishlist-item.entity';
import { Product } from '../models/product.entity';
import { AppError } from '../utils/errors';
import { Repository } from 'typeorm';

export class WishlistService {
  private wishlistRepository: Repository<Wishlist>;
  private wishlistItemRepository: Repository<WishlistItem>;
  private productRepository: Repository<Product>;

  constructor() {
    this.wishlistRepository = AppDataSource.getRepository(Wishlist);
    this.wishlistItemRepository = AppDataSource.getRepository(WishlistItem);
    this.productRepository = AppDataSource.getRepository(Product);
  }

  async getWishlistByUserId(userId: string): Promise<Wishlist> {
    let wishlist = await this.wishlistRepository.findOne({
      where: { userId },
      relations: ['items', 'items.product', 'items.product.category'],
    });

    if (!wishlist) {
      wishlist = this.wishlistRepository.create({
        userId,
        name: 'My Wishlist',
        isPublic: false,
      });
      await this.wishlistRepository.save(wishlist);
      wishlist.items = [];
    }

    return wishlist;
  }

  async addToWishlist(
    userId: string,
    productId: string,
    notes?: string
  ): Promise<Wishlist> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (!product.isActive) {
      throw new AppError('Product is not available', 400);
    }

    let wishlist = await this.wishlistRepository.findOne({
      where: { userId },
      relations: ['items'],
    });

    if (!wishlist) {
      wishlist = this.wishlistRepository.create({
        userId,
        name: 'My Wishlist',
        isPublic: false,
      });
      await this.wishlistRepository.save(wishlist);
    }

    const existingItem = await this.wishlistItemRepository.findOne({
      where: { wishlistId: wishlist.id, productId },
    });

    if (existingItem) {
      throw new AppError('Product is already in your wishlist', 400);
    }

    const wishlistItem = this.wishlistItemRepository.create({
      wishlistId: wishlist.id,
      productId,
      notes,
    });

    await this.wishlistItemRepository.save(wishlistItem);

    return this.getWishlistByUserId(userId);
  }

  async removeFromWishlist(userId: string, productId: string): Promise<Wishlist> {
    const wishlist = await this.wishlistRepository.findOne({
      where: { userId },
    });

    if (!wishlist) {
      throw new AppError('Wishlist not found', 404);
    }

    const wishlistItem = await this.wishlistItemRepository.findOne({
      where: { wishlistId: wishlist.id, productId },
    });

    if (!wishlistItem) {
      throw new AppError('Item not found in wishlist', 404);
    }

    await this.wishlistItemRepository.remove(wishlistItem);

    return this.getWishlistByUserId(userId);
  }

  async updateWishlistItem(
    userId: string,
    productId: string,
    notes: string
  ): Promise<Wishlist> {
    const wishlist = await this.wishlistRepository.findOne({
      where: { userId },
    });

    if (!wishlist) {
      throw new AppError('Wishlist not found', 404);
    }

    const wishlistItem = await this.wishlistItemRepository.findOne({
      where: { wishlistId: wishlist.id, productId },
    });

    if (!wishlistItem) {
      throw new AppError('Item not found in wishlist', 404);
    }

    wishlistItem.notes = notes;
    await this.wishlistItemRepository.save(wishlistItem);

    return this.getWishlistByUserId(userId);
  }

  async clearWishlist(userId: string): Promise<void> {
    const wishlist = await this.wishlistRepository.findOne({
      where: { userId },
      relations: ['items'],
    });

    if (wishlist && wishlist.items.length > 0) {
      await this.wishlistItemRepository.remove(wishlist.items);
    }
  }

  async updateWishlistSettings(
    userId: string,
    name?: string,
    isPublic?: boolean
  ): Promise<Wishlist> {
    let wishlist = await this.wishlistRepository.findOne({
      where: { userId },
    });

    if (!wishlist) {
      wishlist = this.wishlistRepository.create({
        userId,
        name: name || 'My Wishlist',
        isPublic: isPublic || false,
      });
    } else {
      if (name !== undefined) {
        wishlist.name = name;
      }
      if (isPublic !== undefined) {
        wishlist.isPublic = isPublic;
      }
    }

    await this.wishlistRepository.save(wishlist);

    return this.getWishlistByUserId(userId);
  }

  async checkProductInWishlist(userId: string, productId: string): Promise<boolean> {
    const wishlist = await this.wishlistRepository.findOne({
      where: { userId },
    });

    if (!wishlist) {
      return false;
    }

    const item = await this.wishlistItemRepository.findOne({
      where: { wishlistId: wishlist.id, productId },
    });

    return !!item;
  }
}
