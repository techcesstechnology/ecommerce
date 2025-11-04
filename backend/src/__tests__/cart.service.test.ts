import { CartService } from '../services/cart.service';
import { ProductService } from '../services/product.service';
import { CreateProductDto } from '../models/product.model';

describe('CartService', () => {
  let cartService: CartService;
  let productService: ProductService;
  let testProduct1Id: string;

  beforeEach(async () => {
    cartService = new CartService();
    productService = new ProductService();

    // Create test product with unique SKU
    const randomSku = `TEST-CART-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const product1: CreateProductDto = {
      name: 'Test Product 1',
      description: 'Test description 1',
      price: 10.99,
      category: 'test-category',
      stock: 100,
      sku: randomSku,
      status: 'published',
    };

    const createdProduct1 = await productService.createProduct(product1);
    testProduct1Id = createdProduct1.id;
  });

  describe('getCart', () => {
    it('should create a new cart if none exists', async () => {
      const cart = await cartService.getCart('session-1');

      expect(cart).toBeDefined();
      expect(cart.sessionId).toBe('session-1');
      expect(cart.items).toEqual([]);
      expect(cart.subtotal).toBe(0);
      expect(cart.total).toBe(0);
    });

    it('should return existing cart', async () => {
      const cart1 = await cartService.getCart('session-2');
      const cart2 = await cartService.getCart('session-2');

      expect(cart1.id).toBe(cart2.id);
    });
  });

  describe('addItem', () => {
    it('should add item to cart', async () => {
      const cart = await cartService.addItem('session-3', {
        productId: testProduct1Id,
        quantity: 2,
      });

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].productId).toBe(testProduct1Id);
      expect(cart.items[0].quantity).toBe(2);
      expect(cart.items[0].price).toBe(10.99);
      expect(cart.subtotal).toBeGreaterThan(0);
    });

    it('should increase quantity if item already in cart', async () => {
      await cartService.addItem('session-4', {
        productId: testProduct1Id,
        quantity: 1,
      });

      const cart = await cartService.addItem('session-4', {
        productId: testProduct1Id,
        quantity: 2,
      });

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(3);
    });

    it('should throw error if product not found', async () => {
      await expect(
        cartService.addItem('session-5', {
          productId: 'non-existent',
          quantity: 1,
        })
      ).rejects.toThrow('Product not found');
    });

    it('should throw error if insufficient stock', async () => {
      await expect(
        cartService.addItem('session-6', {
          productId: testProduct1Id,
          quantity: 1000,
        })
      ).rejects.toThrow('Insufficient stock');
    });
  });

  describe('updateItem', () => {
    it('should update item quantity', async () => {
      const cart1 = await cartService.addItem('session-7', {
        productId: testProduct1Id,
        quantity: 2,
      });

      const itemId = cart1.items[0].id;
      const cart2 = await cartService.updateItem('session-7', itemId, {
        quantity: 5,
      });

      expect(cart2.items[0].quantity).toBe(5);
    });

    it('should throw error if item not found', async () => {
      await expect(
        cartService.updateItem('session-8', 'non-existent', { quantity: 1 })
      ).rejects.toThrow('Cart item not found');
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', async () => {
      const cart1 = await cartService.addItem('session-9', {
        productId: testProduct1Id,
        quantity: 1,
      });

      const itemId = cart1.items[0].id;
      const cart2 = await cartService.removeItem('session-9', itemId);

      expect(cart2.items).toHaveLength(0);
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', async () => {
      await cartService.addItem('session-10', {
        productId: testProduct1Id,
        quantity: 1,
      });

      // Create second product for this test
      const product2: CreateProductDto = {
        name: 'Test Product 2',
        description: 'Test description 2',
        price: 20.5,
        category: 'test-category',
        stock: 50,
        sku: `TEST-CART-2-${Date.now()}`,
        status: 'published',
      };
      const createdProduct2 = await productService.createProduct(product2);

      await cartService.addItem('session-10', {
        productId: createdProduct2.id,
        quantity: 2,
      });

      const cart = await cartService.clearCart('session-10');

      expect(cart.items).toHaveLength(0);
      expect(cart.subtotal).toBe(0);
    });
  });

  describe('applyDiscount', () => {
    it('should apply valid discount code', async () => {
      await cartService.addItem('session-11', {
        productId: testProduct1Id,
        quantity: 1,
      });

      const cart = await cartService.applyDiscount('session-11', {
        code: 'SAVE10',
      });

      expect(cart.discountCode).toBe('SAVE10');
      expect(cart.discount).toBeGreaterThan(0);
    });

    it('should throw error for invalid discount code', async () => {
      await cartService.addItem('session-12', {
        productId: testProduct1Id,
        quantity: 1,
      });

      await expect(
        cartService.applyDiscount('session-12', {
          code: 'INVALID',
        })
      ).rejects.toThrow('Invalid discount code');
    });
  });

  describe('getCartSummary', () => {
    it('should return cart summary', async () => {
      await cartService.addItem('session-13', {
        productId: testProduct1Id,
        quantity: 2,
      });

      const summary = await cartService.getCartSummary('session-13');

      expect(summary.itemCount).toBe(2);
      expect(summary.subtotal).toBeGreaterThan(0);
      expect(summary.total).toBeGreaterThan(0);
    });
  });

  describe('saveForLater', () => {
    it('should save item for later', async () => {
      const cart = await cartService.addItem('session-14', {
        productId: testProduct1Id,
        quantity: 1,
      });

      const itemId = cart.items[0].id;
      const savedItems = await cartService.saveForLater('session-14', itemId, 'user-1');

      expect(savedItems).toHaveLength(1);

      const updatedCart = await cartService.getCart('session-14', 'user-1');
      expect(updatedCart.items).toHaveLength(0);
    });

    it('should throw error if user not logged in', async () => {
      const cart = await cartService.addItem('session-15', {
        productId: testProduct1Id,
        quantity: 1,
      });

      const itemId = cart.items[0].id;
      await expect(cartService.saveForLater('session-15', itemId, '')).rejects.toThrow(
        'User must be logged in'
      );
    });
  });

  describe('mergeCarts', () => {
    it('should merge guest cart with user cart', async () => {
      // Create second product for this test
      const product2: CreateProductDto = {
        name: 'Test Product 2',
        description: 'Test description 2',
        price: 20.5,
        category: 'test-category',
        stock: 50,
        sku: `TEST-CART-MERGE-${Date.now()}`,
        status: 'published',
      };
      const createdProduct2 = await productService.createProduct(product2);

      // Add items to guest cart
      await cartService.addItem('guest-session', {
        productId: testProduct1Id,
        quantity: 1,
      });

      // Add items to user cart
      await cartService.addItem(
        'user-session',
        {
          productId: createdProduct2.id,
          quantity: 2,
        },
        'user-2'
      );

      // Merge carts
      const mergedCart = await cartService.mergeCarts('guest-session', 'user-2');

      expect(mergedCart.items).toHaveLength(2);
    });
  });

  describe('validateCartStock', () => {
    it('should validate cart items have sufficient stock', async () => {
      const cart = await cartService.addItem('session-16', {
        productId: testProduct1Id,
        quantity: 1,
      });

      const validation = await cartService.validateCartStock(cart);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });
});
