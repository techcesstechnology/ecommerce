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
    const userIdNum = Number(userId);
    if (!Number.isInteger(userIdNum) || userIdNum <= 0) {
      throw new AppError('Invalid user ID', 400);
    }

    let wishlist = await this.wishlistRepository.findOne({
      where: { userId: userIdNum },
      relations: ['items', 'items.product', 'items.product.category'],
    });

    if (!wishlist) {
      wishlist = this.wishlistRepository.create({
        userId: userIdNum,
        name: 'My Wishlist',
        isPrivate: false,
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
    const userIdNum = Number(userId);
    if (!Number.isInteger(userIdNum) || userIdNum <= 0) {
      throw new AppError('Invalid user ID', 400);
    }

    const productIdNum = Number(productId);
    if (!Number.isInteger(productIdNum) || productIdNum <= 0) {
      throw new AppError('Invalid product ID', 400);
    }
    const product = await this.productRepository.findOne({
      where: { id: productIdNum },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (!product.isActive) {
      throw new AppError('Product is not available', 400);
    }

    let wishlist = await this.wishlistRepository.findOne({
      where: { userId: userIdNum },
      relations: ['items'],
    });

    if (!wishlist) {
      wishlist = this.wishlistRepository.create({
        userId: userIdNum,
        name: 'My Wishlist',
        isPrivate: false,
      });
      await this.wishlistRepository.save(wishlist);
    }

    const existingItem = await this.wishlistItemRepository.findOne({
      where: { wishlistId: wishlist.id, productId: productIdNum },
    });

    if (existingItem) {
      throw new AppError('Product is already in your wishlist', 400);
    }

    const wishlistItem = this.wishlistItemRepository.create({
      wishlistId: wishlist.id,
      productId: productIdNum,
      notes,
    });

    await this.wishlistItemRepository.save(wishlistItem);

    return this.getWishlistByUserId(userId);
  }

  async removeFromWishlist(userId: string, productId: string): Promise<Wishlist> {
    const userIdNum = Number(userId);
    if (!Number.isInteger(userIdNum) || userIdNum <= 0) {
      throw new AppError('Invalid user ID', 400);
    }

    const productIdNum = Number(productId);
    if (!Number.isInteger(productIdNum) || productIdNum <= 0) {
      throw new AppError('Invalid product ID', 400);
    }

    const wishlist = await this.wishlistRepository.findOne({
      where: { userId: userIdNum },
    });

    if (!wishlist) {
      throw new AppError('Wishlist not found', 404);
    }

    const wishlistItem = await this.wishlistItemRepository.findOne({
      where: { wishlistId: wishlist.id, productId: productIdNum },
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
    const userIdNum = Number(userId);
    if (!Number.isInteger(userIdNum) || userIdNum <= 0) {
      throw new AppError('Invalid user ID', 400);
    }

    const productIdNum = Number(productId);
    if (!Number.isInteger(productIdNum) || productIdNum <= 0) {
      throw new AppError('Invalid product ID', 400);
    }

    const wishlist = await this.wishlistRepository.findOne({
      where: { userId: userIdNum },
    });

    if (!wishlist) {
      throw new AppError('Wishlist not found', 404);
    }

    const wishlistItem = await this.wishlistItemRepository.findOne({
      where: { wishlistId: wishlist.id, productId: productIdNum },
    });

    if (!wishlistItem) {
      throw new AppError('Item not found in wishlist', 404);
    }

    wishlistItem.notes = notes;
    await this.wishlistItemRepository.save(wishlistItem);

    return this.getWishlistByUserId(userId);
  }

  async clearWishlist(userId: string): Promise<void> {
    const userIdNum = Number(userId);
    if (!Number.isInteger(userIdNum) || userIdNum <= 0) {
      throw new AppError('Invalid user ID', 400);
    }

    const wishlist = await this.wishlistRepository.findOne({
      where: { userId: userIdNum },
      relations: ['items'],
    });

    if (wishlist && wishlist.items.length > 0) {
      await this.wishlistItemRepository.remove(wishlist.items);
    }
  }

  async updateWishlistSettings(
    userId: string,
    name?: string,
    isPrivate?: boolean
  ): Promise<Wishlist> {
    const userIdNum = Number(userId);
    if (!Number.isInteger(userIdNum) || userIdNum <= 0) {
      throw new AppError('Invalid user ID', 400);
    }

    let wishlist = await this.wishlistRepository.findOne({
      where: { userId: userIdNum },
    });

    if (!wishlist) {
      wishlist = this.wishlistRepository.create({
        userId: userIdNum,
        name: name || 'My Wishlist',
        isPrivate: isPrivate !== undefined ? isPrivate : false,
      });
    } else {
      if (name !== undefined) {
        wishlist.name = name;
      }
      if (isPrivate !== undefined) {
        wishlist.isPrivate = isPrivate;
      }
    }

    await this.wishlistRepository.save(wishlist);

    return this.getWishlistByUserId(userId);
  }

  async checkProductInWishlist(userId: string, productId: string): Promise<boolean> {
    const userIdNum = Number(userId);
    if (!Number.isInteger(userIdNum) || userIdNum <= 0) {
      return false;
    }

    const productIdNum = Number(productId);
    if (!Number.isInteger(productIdNum) || productIdNum <= 0) {
      return false;
    }

    const wishlist = await this.wishlistRepository.findOne({
      where: { userId: userIdNum },
    });

    if (!wishlist) {
      return false;
    }

    const item = await this.wishlistItemRepository.findOne({
      where: { wishlistId: wishlist.id, productId: productIdNum },
    });

    return !!item;
  }
}
