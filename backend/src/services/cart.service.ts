import { v4 as uuidv4 } from 'uuid';
import {
  Cart,
  CartItem,
  AddToCartDto,
  UpdateCartItemDto,
  ApplyDiscountDto,
  SavedItem,
  CartSummary,
} from '../models/cart.model';
import { productService } from './product.service';
import {
  calculateItemSubtotal,
  calculateTax,
  calculateShipping,
  calculateTotal,
  validateDiscountCode,
} from '../utils/price.utils';

// In-memory storage for carts
const cartsStore = new Map<string, Cart>();
const savedItemsStore = new Map<string, SavedItem[]>();

export class CartService {
  /**
   * Get cart by session ID or create new one
   */
  async getCart(sessionId: string, userId?: string): Promise<Cart> {
    let cart = Array.from(cartsStore.values()).find(
      (c) => c.sessionId === sessionId || (userId && c.userId === userId)
    );

    if (!cart) {
      cart = this.createNewCart(sessionId, userId);
      cartsStore.set(cart.id, cart);
    }

    return cart;
  }

  /**
   * Create a new cart
   */
  private createNewCart(sessionId: string, userId?: string): Cart {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    return {
      id: uuidv4(),
      userId,
      sessionId,
      items: [],
      subtotal: 0,
      discount: 0,
      tax: 0,
      shipping: 0,
      total: 0,
      currency: 'USD',
      createdAt: now,
      updatedAt: now,
      expiresAt,
    };
  }

  /**
   * Add item to cart
   */
  async addItem(sessionId: string, data: AddToCartDto, userId?: string): Promise<Cart> {
    const cart = await this.getCart(sessionId, userId);
    const product = await productService.getProductById(data.productId);

    if (!product) {
      throw new Error('Product not found');
    }

    if (product.status !== 'published') {
      throw new Error('Product is not available');
    }

    if (product.stock < data.quantity) {
      throw new Error('Insufficient stock');
    }

    // Check if item already exists in cart
    const existingItem = cart.items.find((item) => item.productId === data.productId);

    if (existingItem) {
      existingItem.quantity += data.quantity;
      existingItem.subtotal = calculateItemSubtotal(existingItem.price, existingItem.quantity);
    } else {
      const newItem: CartItem = {
        id: uuidv4(),
        productId: product.id,
        productName: product.name,
        productImage: product.images[0],
        quantity: data.quantity,
        price: product.price,
        subtotal: calculateItemSubtotal(product.price, data.quantity),
      };
      cart.items.push(newItem);
    }

    cart.updatedAt = new Date();
    this.recalculateCart(cart);
    cartsStore.set(cart.id, cart);

    return cart;
  }

  /**
   * Update cart item quantity
   */
  async updateItem(
    sessionId: string,
    itemId: string,
    data: UpdateCartItemDto,
    userId?: string
  ): Promise<Cart> {
    const cart = await this.getCart(sessionId, userId);
    const item = cart.items.find((i) => i.id === itemId);

    if (!item) {
      throw new Error('Cart item not found');
    }

    const product = await productService.getProductById(item.productId);

    if (!product) {
      throw new Error('Product not found');
    }

    if (product.stock < data.quantity) {
      throw new Error('Insufficient stock');
    }

    item.quantity = data.quantity;
    item.subtotal = calculateItemSubtotal(item.price, item.quantity);

    cart.updatedAt = new Date();
    this.recalculateCart(cart);
    cartsStore.set(cart.id, cart);

    return cart;
  }

  /**
   * Remove item from cart
   */
  async removeItem(sessionId: string, itemId: string, userId?: string): Promise<Cart> {
    const cart = await this.getCart(sessionId, userId);
    cart.items = cart.items.filter((item) => item.id !== itemId);

    cart.updatedAt = new Date();
    this.recalculateCart(cart);
    cartsStore.set(cart.id, cart);

    return cart;
  }

  /**
   * Clear cart
   */
  async clearCart(sessionId: string, userId?: string): Promise<Cart> {
    const cart = await this.getCart(sessionId, userId);
    cart.items = [];
    cart.discountCode = undefined;

    cart.updatedAt = new Date();
    this.recalculateCart(cart);
    cartsStore.set(cart.id, cart);

    return cart;
  }

  /**
   * Apply discount code
   */
  async applyDiscount(sessionId: string, data: ApplyDiscountDto, userId?: string): Promise<Cart> {
    const cart = await this.getCart(sessionId, userId);
    const validation = validateDiscountCode(data.code, cart.subtotal);

    if (!validation.valid) {
      throw new Error(validation.message);
    }

    cart.discountCode = data.code;
    cart.discount = validation.discount;
    cart.updatedAt = new Date();
    this.recalculateCart(cart);
    cartsStore.set(cart.id, cart);

    return cart;
  }

  /**
   * Remove discount code
   */
  async removeDiscount(sessionId: string, userId?: string): Promise<Cart> {
    const cart = await this.getCart(sessionId, userId);
    cart.discountCode = undefined;
    cart.discount = 0;

    cart.updatedAt = new Date();
    this.recalculateCart(cart);
    cartsStore.set(cart.id, cart);

    return cart;
  }

  /**
   * Get cart summary
   */
  async getCartSummary(sessionId: string, userId?: string): Promise<CartSummary> {
    const cart = await this.getCart(sessionId, userId);

    return {
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: cart.subtotal,
      discount: cart.discount,
      tax: cart.tax,
      shipping: cart.shipping,
      total: cart.total,
      currency: cart.currency,
    };
  }

  /**
   * Save item for later
   */
  async saveForLater(sessionId: string, itemId: string, userId: string): Promise<SavedItem[]> {
    if (!userId) {
      throw new Error('User must be logged in to save items');
    }

    const cart = await this.getCart(sessionId, userId);
    const item = cart.items.find((i) => i.id === itemId);

    if (!item) {
      throw new Error('Cart item not found');
    }

    const savedItem: SavedItem = {
      id: uuidv4(),
      userId,
      productId: item.productId,
      productName: item.productName,
      productImage: item.productImage,
      price: item.price,
      savedAt: new Date(),
    };

    const savedItems = savedItemsStore.get(userId) || [];
    savedItems.push(savedItem);
    savedItemsStore.set(userId, savedItems);

    // Remove from cart
    await this.removeItem(sessionId, itemId, userId);

    return savedItems;
  }

  /**
   * Get saved items
   */
  async getSavedItems(userId: string): Promise<SavedItem[]> {
    return savedItemsStore.get(userId) || [];
  }

  /**
   * Move saved item back to cart
   */
  async moveToCart(sessionId: string, savedItemId: string, userId: string): Promise<Cart> {
    if (!userId) {
      throw new Error('User must be logged in');
    }

    const savedItems = savedItemsStore.get(userId) || [];
    const savedItem = savedItems.find((item) => item.id === savedItemId);

    if (!savedItem) {
      throw new Error('Saved item not found');
    }

    // Add back to cart
    const cart = await this.addItem(
      sessionId,
      {
        productId: savedItem.productId,
        quantity: 1,
      },
      userId
    );

    // Remove from saved items
    const updatedSavedItems = savedItems.filter((item) => item.id !== savedItemId);
    savedItemsStore.set(userId, updatedSavedItems);

    return cart;
  }

  /**
   * Merge guest cart with user cart on login
   */
  async mergeCarts(guestSessionId: string, userId: string): Promise<Cart> {
    const guestCart = await this.getCart(guestSessionId);
    const userCart = await this.getCart('', userId);

    // Merge items
    for (const guestItem of guestCart.items) {
      const existingItem = userCart.items.find((item) => item.productId === guestItem.productId);

      if (existingItem) {
        existingItem.quantity += guestItem.quantity;
        existingItem.subtotal = calculateItemSubtotal(existingItem.price, existingItem.quantity);
      } else {
        userCart.items.push({ ...guestItem, id: uuidv4() });
      }
    }

    // Copy discount code if exists
    if (guestCart.discountCode && !userCart.discountCode) {
      userCart.discountCode = guestCart.discountCode;
    }

    userCart.updatedAt = new Date();
    this.recalculateCart(userCart);
    cartsStore.set(userCart.id, userCart);

    // Delete guest cart
    cartsStore.delete(guestCart.id);

    return userCart;
  }

  /**
   * Recalculate cart totals
   */
  private recalculateCart(cart: Cart): void {
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);

    // Recalculate discount if code exists
    if (cart.discountCode) {
      const validation = validateDiscountCode(cart.discountCode, cart.subtotal);
      cart.discount = validation.valid ? validation.discount : 0;
    }

    cart.tax = calculateTax(cart.subtotal - cart.discount);
    cart.shipping = calculateShipping(cart.subtotal);
    cart.total = calculateTotal(cart.subtotal, cart.discount, cart.tax, cart.shipping);
  }

  /**
   * Validate cart items stock
   */
  async validateCartStock(cart: Cart): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    for (const item of cart.items) {
      const product = await productService.getProductById(item.productId);

      if (!product) {
        errors.push(`Product ${item.productName} not found`);
        continue;
      }

      if (product.status !== 'published') {
        errors.push(`Product ${item.productName} is no longer available`);
        continue;
      }

      if (product.stock < item.quantity) {
        errors.push(
          `Insufficient stock for ${item.productName}. Available: ${product.stock}, Requested: ${item.quantity}`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const cartService = new CartService();
