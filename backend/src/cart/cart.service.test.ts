import { CartService } from './cart.service';
import { redisClient } from '../utils/redis';
import { Currency } from '../types';

jest.mock('../utils/redis');

describe('CartService', () => {
  let cartService: CartService;
  const mockUserId = 'user123';

  beforeEach(() => {
    cartService = new CartService();
    jest.clearAllMocks();
  });

  describe('addToCart', () => {
    it('should add a new item to empty cart', async () => {
      jest.spyOn(redisClient, 'get').mockResolvedValue(null);
      const mockSet = jest.spyOn(redisClient, 'set').mockResolvedValue();

      const input = {
        userId: mockUserId,
        productId: 'prod1',
        name: 'Test Product',
        price: 10.99,
        quantity: 2,
        currency: Currency.USD,
      };

      const result = await cartService.addToCart(input);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].productId).toBe('prod1');
      expect(result.items[0].quantity).toBe(2);
      expect(result.total).toBe(21.98);
      expect(mockSet).toHaveBeenCalled();
    });

    it('should increment quantity for existing item', async () => {
      const existingCart = {
        userId: mockUserId,
        items: [
          {
            productId: 'prod1',
            name: 'Test Product',
            price: 10.99,
            quantity: 1,
            currency: Currency.USD,
          },
        ],
        total: 10.99,
        currency: Currency.USD,
        updatedAt: new Date(),
      };

      jest.spyOn(redisClient, 'get').mockResolvedValue(JSON.stringify(existingCart));
      jest.spyOn(redisClient, 'set').mockResolvedValue();

      const input = {
        userId: mockUserId,
        productId: 'prod1',
        name: 'Test Product',
        price: 10.99,
        quantity: 2,
        currency: Currency.USD,
      };

      const result = await cartService.addToCart(input);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].quantity).toBe(3);
      expect(result.total).toBe(32.97);
    });
  });

  describe('updateCartItem', () => {
    it('should update quantity of existing item', async () => {
      const existingCart = {
        userId: mockUserId,
        items: [
          {
            productId: 'prod1',
            name: 'Test Product',
            price: 10.99,
            quantity: 2,
            currency: Currency.USD,
          },
        ],
        total: 21.98,
        currency: Currency.USD,
        updatedAt: new Date(),
      };

      jest.spyOn(redisClient, 'get').mockResolvedValue(JSON.stringify(existingCart));
      jest.spyOn(redisClient, 'set').mockResolvedValue();

      const input = {
        userId: mockUserId,
        productId: 'prod1',
        quantity: 5,
      };

      const result = await cartService.updateCartItem(input);

      expect(result.items[0].quantity).toBe(5);
      expect(result.total).toBe(54.95);
    });

    it('should throw error if item not found', async () => {
      const existingCart = {
        userId: mockUserId,
        items: [],
        total: 0,
        currency: Currency.USD,
        updatedAt: new Date(),
      };

      jest.spyOn(redisClient, 'get').mockResolvedValue(JSON.stringify(existingCart));

      const input = {
        userId: mockUserId,
        productId: 'prod1',
        quantity: 5,
      };

      await expect(cartService.updateCartItem(input)).rejects.toThrow('Item not found in cart');
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart', async () => {
      const existingCart = {
        userId: mockUserId,
        items: [
          {
            productId: 'prod1',
            name: 'Product 1',
            price: 10.99,
            quantity: 2,
            currency: Currency.USD,
          },
          {
            productId: 'prod2',
            name: 'Product 2',
            price: 5.99,
            quantity: 1,
            currency: Currency.USD,
          },
        ],
        total: 27.97,
        currency: Currency.USD,
        updatedAt: new Date(),
      };

      jest.spyOn(redisClient, 'get').mockResolvedValue(JSON.stringify(existingCart));
      jest.spyOn(redisClient, 'set').mockResolvedValue();

      const input = {
        userId: mockUserId,
        productId: 'prod1',
      };

      const result = await cartService.removeFromCart(input);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].productId).toBe('prod2');
      expect(result.total).toBe(5.99);
    });
  });

  describe('getCart', () => {
    it('should return empty cart for new user', async () => {
      jest.spyOn(redisClient, 'get').mockResolvedValue(null);

      const result = await cartService.getCart(mockUserId);

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.userId).toBe(mockUserId);
    });

    it('should return existing cart', async () => {
      const existingCart = {
        userId: mockUserId,
        items: [
          {
            productId: 'prod1',
            name: 'Test Product',
            price: 10.99,
            quantity: 2,
            currency: Currency.USD,
          },
        ],
        total: 21.98,
        currency: Currency.USD,
        updatedAt: new Date(),
      };

      jest.spyOn(redisClient, 'get').mockResolvedValue(JSON.stringify(existingCart));

      const result = await cartService.getCart(mockUserId);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(21.98);
    });
  });
});
