import { AppDataSource } from '../config/database.config';
import { Cart } from '../models/cart.entity';
import { CartItem } from '../models/cart-item.entity';
import { Product } from '../models/product.entity';
import { Promotion } from '../models/promotion.entity';
import { AppError } from '../utils/errors';
import { Repository } from 'typeorm';

interface CartSummary {
  cart: Cart;
  items: Array<CartItem & { product: Product }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

export class CartService {
  private cartRepository: Repository<Cart>;
  private cartItemRepository: Repository<CartItem>;
  private productRepository: Repository<Product>;
  private promotionRepository: Repository<Promotion>;

  constructor() {
    this.cartRepository = AppDataSource.getRepository(Cart);
    this.cartItemRepository = AppDataSource.getRepository(CartItem);
    this.productRepository = AppDataSource.getRepository(Product);
    this.promotionRepository = AppDataSource.getRepository(Promotion);
  }

  async getCartByUserId(userId: string): Promise<CartSummary> {
    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      cart = this.cartRepository.create({ userId });
      await this.cartRepository.save(cart);
      cart.items = [];
    }

    await this.revalidatePromoCode(cart);

    return this.calculateCartTotals(cart);
  }

  async addToCart(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<CartSummary> {
    if (quantity <= 0) {
      throw new AppError('Quantity must be greater than 0', 400);
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

    if (product.stockQuantity < quantity) {
      throw new AppError(
        `Only ${product.stockQuantity} items available in stock`,
        400
      );
    }

    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items'],
    });

    if (!cart) {
      cart = this.cartRepository.create({ userId });
      await this.cartRepository.save(cart);
    }

    const existingItem = await this.cartItemRepository.findOne({
      where: { cartId: cart.id, productId: productIdNum },
    });

    const finalPrice = product.salePrice || product.price;

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.stockQuantity < newQuantity) {
        throw new AppError(
          `Only ${product.stockQuantity} items available in stock`,
          400
        );
      }
      existingItem.quantity = newQuantity;
      existingItem.price = finalPrice;
      await this.cartItemRepository.save(existingItem);
    } else {
      const cartItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId: productIdNum,
        quantity,
        price: finalPrice,
      });
      await this.cartItemRepository.save(cartItem);
    }

    return this.getCartByUserId(userId);
  }

  async updateCartItemQuantity(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<CartSummary> {
    if (quantity < 0) {
      throw new AppError('Quantity cannot be negative', 400);
    }

    const productIdNum = Number(productId);
    if (!Number.isInteger(productIdNum) || productIdNum <= 0) {
      throw new AppError('Invalid product ID', 400);
    }

    const cart = await this.cartRepository.findOne({
      where: { userId },
    });

    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    const cartItem = await this.cartItemRepository.findOne({
      where: { cartId: cart.id, productId: productIdNum },
      relations: ['product'],
    });

    if (!cartItem) {
      throw new AppError('Item not found in cart', 404);
    }

    if (quantity === 0) {
      await this.cartItemRepository.remove(cartItem);
    } else {
      if (cartItem.product.stockQuantity < quantity) {
        throw new AppError(
          `Only ${cartItem.product.stockQuantity} items available in stock`,
          400
        );
      }
      cartItem.quantity = quantity;
      const finalPrice = cartItem.product.salePrice || cartItem.product.price;
      cartItem.price = finalPrice;
      await this.cartItemRepository.save(cartItem);
    }

    return this.getCartByUserId(userId);
  }

  async removeFromCart(
    userId: string,
    productId: string
  ): Promise<CartSummary> {
    const productIdNum = Number(productId);
    if (!Number.isInteger(productIdNum) || productIdNum <= 0) {
      throw new AppError('Invalid product ID', 400);
    }

    const cart = await this.cartRepository.findOne({
      where: { userId },
    });

    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    const cartItem = await this.cartItemRepository.findOne({
      where: { cartId: cart.id, productId: productIdNum },
    });

    if (!cartItem) {
      throw new AppError('Item not found in cart', 404);
    }

    await this.cartItemRepository.remove(cartItem);

    return this.getCartByUserId(userId);
  }

  async clearCart(userId: string): Promise<void> {
    const cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items'],
    });

    if (cart && cart.items.length > 0) {
      await this.cartItemRepository.remove(cart.items);
    }

    if (cart) {
      cart.promoCode = undefined;
      cart.discount = 0;
      await this.cartRepository.save(cart);
    }
  }

  async applyPromoCode(
    userId: string,
    promoCode: string
  ): Promise<CartSummary> {
    const cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items', 'items.product'],
    });

    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart is empty', 400);
    }

    const promotion = await this.promotionRepository.findOne({
      where: { code: promoCode.toUpperCase(), isActive: true },
    });

    if (!promotion) {
      throw new AppError('Invalid promo code', 404);
    }

    const now = new Date();
    if (now < promotion.startDate || now > promotion.endDate) {
      throw new AppError('Promo code has expired or is not yet active', 400);
    }

    if (
      promotion.usageLimit &&
      promotion.usageCount >= promotion.usageLimit
    ) {
      throw new AppError('Promo code usage limit reached', 400);
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );

    if (
      promotion.minPurchaseAmount &&
      subtotal < Number(promotion.minPurchaseAmount)
    ) {
      throw new AppError(
        `Minimum purchase amount of $${promotion.minPurchaseAmount} required`,
        400
      );
    }

    let discount = 0;
    if (promotion.type === 'percentage') {
      discount = (subtotal * Number(promotion.value)) / 100;
      if (
        promotion.maxDiscountAmount &&
        discount > Number(promotion.maxDiscountAmount)
      ) {
        discount = Number(promotion.maxDiscountAmount);
      }
    } else if (promotion.type === 'fixed') {
      discount = Number(promotion.value);
    }

    cart.promoCode = promoCode.toUpperCase();
    cart.discount = discount;
    await this.cartRepository.save(cart);

    return this.calculateCartTotals(cart);
  }

  async removePromoCode(userId: string): Promise<CartSummary> {
    const cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    cart.promoCode = undefined;
    cart.discount = 0;
    await this.cartRepository.save(cart);

    return this.calculateCartTotals(cart);
  }

  private async revalidatePromoCode(cart: Cart): Promise<void> {
    if (!cart.promoCode) {
      cart.discount = 0;
      return;
    }

    const promotion = await this.promotionRepository.findOne({
      where: { code: cart.promoCode, isActive: true },
    });

    if (!promotion) {
      cart.promoCode = undefined;
      cart.discount = 0;
      await this.cartRepository.save(cart);
      return;
    }

    const now = new Date();
    if (now < promotion.startDate || now > promotion.endDate) {
      cart.promoCode = undefined;
      cart.discount = 0;
      await this.cartRepository.save(cart);
      return;
    }

    if (
      promotion.usageLimit &&
      promotion.usageCount >= promotion.usageLimit
    ) {
      cart.promoCode = undefined;
      cart.discount = 0;
      await this.cartRepository.save(cart);
      return;
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );

    if (
      promotion.minPurchaseAmount &&
      subtotal < Number(promotion.minPurchaseAmount)
    ) {
      cart.promoCode = undefined;
      cart.discount = 0;
      await this.cartRepository.save(cart);
      return;
    }

    let discount = 0;
    if (promotion.type === 'percentage') {
      discount = (subtotal * Number(promotion.value)) / 100;
      if (
        promotion.maxDiscountAmount &&
        discount > Number(promotion.maxDiscountAmount)
      ) {
        discount = Number(promotion.maxDiscountAmount);
      }
    } else if (promotion.type === 'fixed') {
      discount = Number(promotion.value);
    }

    cart.discount = discount;
    await this.cartRepository.save(cart);
  }

  async incrementPromotionUsage(promoCode: string): Promise<void> {
    const promotion = await this.promotionRepository.findOne({
      where: { code: promoCode.toUpperCase() },
    });

    if (promotion) {
      promotion.usageCount = (promotion.usageCount || 0) + 1;
      await this.promotionRepository.save(promotion);
    }
  }

  private calculateCartTotals(cart: Cart): CartSummary {
    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );

    let discount = Number(cart.discount || 0);

    const taxRate = parseFloat(process.env.TAX_RATE || '0.15');
    const discountedSubtotal = Math.max(0, subtotal - discount);
    const tax = discountedSubtotal * taxRate;
    const total = discountedSubtotal + tax;

    return {
      cart,
      items: cart.items,
      subtotal: parseFloat(subtotal.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    };
  }
}
