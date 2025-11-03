import { redisClient } from '../utils/redis';
import { Cart, CartItem, Currency } from '../types';
import { AddToCartInput, UpdateCartItemInput, RemoveFromCartInput } from './cart.validator';

const CART_PREFIX = 'cart:';
const CART_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds

export class CartService {
  private getCartKey(userId: string): string {
    return `${CART_PREFIX}${userId}`;
  }

  async getCart(userId: string): Promise<Cart> {
    const cartKey = this.getCartKey(userId);
    const cartData = await redisClient.get(cartKey);

    if (!cartData) {
      return {
        userId,
        items: [],
        total: 0,
        currency: Currency.USD,
        updatedAt: new Date(),
      };
    }

    return JSON.parse(cartData);
  }

  async addToCart(input: AddToCartInput): Promise<Cart> {
    const cart = await this.getCart(input.userId);

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId === input.productId
    );

    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += input.quantity;
    } else {
      const newItem: CartItem = {
        productId: input.productId,
        name: input.name,
        price: input.price,
        quantity: input.quantity,
        currency: input.currency,
        imageUrl: input.imageUrl,
      };
      cart.items.push(newItem);
    }

    cart.currency = input.currency;
    cart.total = this.calculateTotal(cart.items);
    cart.updatedAt = new Date();

    await this.saveCart(cart);
    return cart;
  }

  async updateCartItem(input: UpdateCartItemInput): Promise<Cart> {
    const cart = await this.getCart(input.userId);

    const itemIndex = cart.items.findIndex(
      (item) => item.productId === input.productId
    );

    if (itemIndex === -1) {
      throw new Error('Item not found in cart');
    }

    cart.items[itemIndex].quantity = input.quantity;
    cart.total = this.calculateTotal(cart.items);
    cart.updatedAt = new Date();

    await this.saveCart(cart);
    return cart;
  }

  async removeFromCart(input: RemoveFromCartInput): Promise<Cart> {
    const cart = await this.getCart(input.userId);

    cart.items = cart.items.filter(
      (item) => item.productId !== input.productId
    );

    cart.total = this.calculateTotal(cart.items);
    cart.updatedAt = new Date();

    await this.saveCart(cart);
    return cart;
  }

  async clearCart(userId: string): Promise<void> {
    const cartKey = this.getCartKey(userId);
    await redisClient.del(cartKey);
  }

  private calculateTotal(items: CartItem[]): number {
    return items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  }

  private async saveCart(cart: Cart): Promise<void> {
    const cartKey = this.getCartKey(cart.userId);
    const cartData = JSON.stringify(cart);
    await redisClient.set(cartKey, cartData, CART_EXPIRY);
  }
}

export const cartService = new CartService();
