import { OrderService } from '../services/order.service';
import { ProductService } from '../services/product.service';
import { CreateProductDto } from '../models/product.model';
import { CreateOrderDto } from '../models/order.model';

describe('OrderService', () => {
  let orderService: OrderService;
  let productService: ProductService;
  let testProduct1Id: string;

  beforeEach(async () => {
    orderService = new OrderService();
    productService = new ProductService();

    // Create test product with unique SKU
    const randomSku = `TEST-ORDER-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const product1: CreateProductDto = {
      name: 'Test Order Product 1',
      description: 'Test description 1',
      price: 25.99,
      category: 'test-category',
      stock: 100,
      sku: randomSku,
      status: 'published',
    };

    const createdProduct1 = await productService.createProduct(product1);
    testProduct1Id = createdProduct1.id;
  });

  describe('createOrder', () => {
    it('should create a new order', async () => {
      const orderData: CreateOrderDto = {
        items: [
          {
            productId: testProduct1Id,
            quantity: 2,
            price: 25.99,
          },
        ],
        shippingAddress: {
          fullName: 'John Doe',
          phone: '+263712345678',
          addressLine1: '123 Main St',
          city: 'Harare',
          province: 'Harare',
          country: 'Zimbabwe',
        },
        paymentMethod: 'cash_on_delivery',
      };

      const order = await orderService.createOrder(orderData, 'user-1');

      expect(order).toBeDefined();
      expect(order.id).toBeDefined();
      expect(order.orderNumber).toBeDefined();
      expect(order.userId).toBe('user-1');
      expect(order.items).toHaveLength(1);
      expect(order.status).toBe('pending');
      expect(order.paymentStatus).toBe('pending');
      expect(order.total).toBeGreaterThan(0);
    });

    it('should throw error if no items in order', async () => {
      const orderData: CreateOrderDto = {
        items: [],
        shippingAddress: {
          fullName: 'John Doe',
          phone: '+263712345678',
          addressLine1: '123 Main St',
          city: 'Harare',
          province: 'Harare',
          country: 'Zimbabwe',
        },
        paymentMethod: 'cash_on_delivery',
      };

      await expect(orderService.createOrder(orderData)).rejects.toThrow(
        'Order must contain at least one item'
      );
    });

    it('should throw error if product not found', async () => {
      const orderData: CreateOrderDto = {
        items: [
          {
            productId: 'non-existent',
            quantity: 1,
            price: 10,
          },
        ],
        shippingAddress: {
          fullName: 'John Doe',
          phone: '+263712345678',
          addressLine1: '123 Main St',
          city: 'Harare',
          province: 'Harare',
          country: 'Zimbabwe',
        },
        paymentMethod: 'cash_on_delivery',
      };

      await expect(orderService.createOrder(orderData)).rejects.toThrow('Product not found');
    });

    it('should throw error if insufficient stock', async () => {
      const orderData: CreateOrderDto = {
        items: [
          {
            productId: testProduct1Id,
            quantity: 1000,
            price: 25.99,
          },
        ],
        shippingAddress: {
          fullName: 'John Doe',
          phone: '+263712345678',
          addressLine1: '123 Main St',
          city: 'Harare',
          province: 'Harare',
          country: 'Zimbabwe',
        },
        paymentMethod: 'cash_on_delivery',
      };

      await expect(orderService.createOrder(orderData)).rejects.toThrow('Insufficient stock');
    });

    it('should update product stock after order creation', async () => {
      const initialProduct = await productService.getProductById(testProduct1Id);
      const initialStock = initialProduct!.stock;

      const orderData: CreateOrderDto = {
        items: [
          {
            productId: testProduct1Id,
            quantity: 3,
            price: 25.99,
          },
        ],
        shippingAddress: {
          fullName: 'John Doe',
          phone: '+263712345678',
          addressLine1: '123 Main St',
          city: 'Harare',
          province: 'Harare',
          country: 'Zimbabwe',
        },
        paymentMethod: 'cash_on_delivery',
      };

      await orderService.createOrder(orderData);

      const updatedProduct = await productService.getProductById(testProduct1Id);
      expect(updatedProduct!.stock).toBe(initialStock - 3);
    });
  });

  describe('getOrderById', () => {
    it('should get order by ID', async () => {
      const orderData: CreateOrderDto = {
        items: [
          {
            productId: testProduct1Id,
            quantity: 1,
            price: 25.99,
          },
        ],
        shippingAddress: {
          fullName: 'John Doe',
          phone: '+263712345678',
          addressLine1: '123 Main St',
          city: 'Harare',
          province: 'Harare',
          country: 'Zimbabwe',
        },
        paymentMethod: 'cash_on_delivery',
      };

      const createdOrder = await orderService.createOrder(orderData);
      const fetchedOrder = await orderService.getOrderById(createdOrder.id);

      expect(fetchedOrder).toBeDefined();
      expect(fetchedOrder!.id).toBe(createdOrder.id);
    });

    it('should return undefined for non-existent order', async () => {
      const order = await orderService.getOrderById('non-existent');
      expect(order).toBeUndefined();
    });
  });

  describe('getOrders', () => {
    it('should get orders with filters', async () => {
      const orderData: CreateOrderDto = {
        items: [
          {
            productId: testProduct1Id,
            quantity: 1,
            price: 25.99,
          },
        ],
        shippingAddress: {
          fullName: 'John Doe',
          phone: '+263712345678',
          addressLine1: '123 Main St',
          city: 'Harare',
          province: 'Harare',
          country: 'Zimbabwe',
        },
        paymentMethod: 'cash_on_delivery',
      };

      await orderService.createOrder(orderData, 'user-2');
      await orderService.createOrder(orderData, 'user-2');

      const result = await orderService.getOrders({
        userId: 'user-2',
        page: 1,
        limit: 10,
      });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should filter orders by status', async () => {
      const orderData: CreateOrderDto = {
        items: [
          {
            productId: testProduct1Id,
            quantity: 1,
            price: 25.99,
          },
        ],
        shippingAddress: {
          fullName: 'John Doe',
          phone: '+263712345678',
          addressLine1: '123 Main St',
          city: 'Harare',
          province: 'Harare',
          country: 'Zimbabwe',
        },
        paymentMethod: 'cash_on_delivery',
      };

      await orderService.createOrder(orderData);

      const result = await orderService.getOrders({
        status: 'pending',
      });

      expect(result.items.length).toBeGreaterThan(0);
      result.items.forEach((order) => {
        expect(order.status).toBe('pending');
      });
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status', async () => {
      const orderData: CreateOrderDto = {
        items: [
          {
            productId: testProduct1Id,
            quantity: 1,
            price: 25.99,
          },
        ],
        shippingAddress: {
          fullName: 'John Doe',
          phone: '+263712345678',
          addressLine1: '123 Main St',
          city: 'Harare',
          province: 'Harare',
          country: 'Zimbabwe',
        },
        paymentMethod: 'cash_on_delivery',
      };

      const order = await orderService.createOrder(orderData);
      const updatedOrder = await orderService.updateOrderStatus(order.id, {
        status: 'confirmed',
      });

      expect(updatedOrder.status).toBe('confirmed');
    });

    it('should add tracking number when updating status', async () => {
      const orderData: CreateOrderDto = {
        items: [
          {
            productId: testProduct1Id,
            quantity: 1,
            price: 25.99,
          },
        ],
        shippingAddress: {
          fullName: 'John Doe',
          phone: '+263712345678',
          addressLine1: '123 Main St',
          city: 'Harare',
          province: 'Harare',
          country: 'Zimbabwe',
        },
        paymentMethod: 'cash_on_delivery',
      };

      const order = await orderService.createOrder(orderData);
      const updatedOrder = await orderService.updateOrderStatus(order.id, {
        status: 'shipped',
        trackingNumber: 'TRACK-123456',
      });

      expect(updatedOrder.trackingNumber).toBe('TRACK-123456');
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order', async () => {
      const orderData: CreateOrderDto = {
        items: [
          {
            productId: testProduct1Id,
            quantity: 2,
            price: 25.99,
          },
        ],
        shippingAddress: {
          fullName: 'John Doe',
          phone: '+263712345678',
          addressLine1: '123 Main St',
          city: 'Harare',
          province: 'Harare',
          country: 'Zimbabwe',
        },
        paymentMethod: 'cash_on_delivery',
      };

      const order = await orderService.createOrder(orderData);
      const cancelledOrder = await orderService.cancelOrder(order.id);

      expect(cancelledOrder.status).toBe('cancelled');
      expect(cancelledOrder.cancelledAt).toBeDefined();
    });

    it('should restore product stock when cancelling order', async () => {
      const initialProduct = await productService.getProductById(testProduct1Id);
      const initialStock = initialProduct!.stock;

      const orderData: CreateOrderDto = {
        items: [
          {
            productId: testProduct1Id,
            quantity: 5,
            price: 25.99,
          },
        ],
        shippingAddress: {
          fullName: 'John Doe',
          phone: '+263712345678',
          addressLine1: '123 Main St',
          city: 'Harare',
          province: 'Harare',
          country: 'Zimbabwe',
        },
        paymentMethod: 'cash_on_delivery',
      };

      const order = await orderService.createOrder(orderData);
      await orderService.cancelOrder(order.id);

      const updatedProduct = await productService.getProductById(testProduct1Id);
      expect(updatedProduct!.stock).toBe(initialStock);
    });

    it('should throw error when cancelling delivered order', async () => {
      const orderData: CreateOrderDto = {
        items: [
          {
            productId: testProduct1Id,
            quantity: 1,
            price: 25.99,
          },
        ],
        shippingAddress: {
          fullName: 'John Doe',
          phone: '+263712345678',
          addressLine1: '123 Main St',
          city: 'Harare',
          province: 'Harare',
          country: 'Zimbabwe',
        },
        paymentMethod: 'cash_on_delivery',
      };

      const order = await orderService.createOrder(orderData);
      await orderService.updateOrderStatus(order.id, { status: 'delivered' });

      await expect(orderService.cancelOrder(order.id)).rejects.toThrow(
        'Cannot cancel order with status'
      );
    });
  });

  describe('getOrderTracking', () => {
    it('should get order tracking information', async () => {
      const orderData: CreateOrderDto = {
        items: [
          {
            productId: testProduct1Id,
            quantity: 1,
            price: 25.99,
          },
        ],
        shippingAddress: {
          fullName: 'John Doe',
          phone: '+263712345678',
          addressLine1: '123 Main St',
          city: 'Harare',
          province: 'Harare',
          country: 'Zimbabwe',
        },
        paymentMethod: 'cash_on_delivery',
      };

      const order = await orderService.createOrder(orderData);
      const tracking = await orderService.getOrderTracking(order.id);

      expect(tracking).toBeDefined();
      expect(tracking.orderNumber).toBe(order.orderNumber);
      expect(tracking.status).toBe(order.status);
      expect(tracking.history).toHaveLength(1);
    });
  });

  describe('requestReturn', () => {
    it('should create return request for delivered order', async () => {
      const orderData: CreateOrderDto = {
        items: [
          {
            productId: testProduct1Id,
            quantity: 1,
            price: 25.99,
          },
        ],
        shippingAddress: {
          fullName: 'John Doe',
          phone: '+263712345678',
          addressLine1: '123 Main St',
          city: 'Harare',
          province: 'Harare',
          country: 'Zimbabwe',
        },
        paymentMethod: 'cash_on_delivery',
      };

      const order = await orderService.createOrder(orderData);
      await orderService.updateOrderStatus(order.id, { status: 'delivered' });

      const returnRequest = await orderService.requestReturn({
        orderId: order.id,
        items: [
          {
            orderItemId: order.items[0].id,
            quantity: 1,
            reason: 'Defective product',
          },
        ],
      });

      expect(returnRequest).toBeDefined();
      expect(returnRequest.id).toBeDefined();
      expect(returnRequest.status).toBe('pending');
    });

    it('should throw error when returning non-delivered order', async () => {
      const orderData: CreateOrderDto = {
        items: [
          {
            productId: testProduct1Id,
            quantity: 1,
            price: 25.99,
          },
        ],
        shippingAddress: {
          fullName: 'John Doe',
          phone: '+263712345678',
          addressLine1: '123 Main St',
          city: 'Harare',
          province: 'Harare',
          country: 'Zimbabwe',
        },
        paymentMethod: 'cash_on_delivery',
      };

      const order = await orderService.createOrder(orderData);

      await expect(
        orderService.requestReturn({
          orderId: order.id,
          items: [
            {
              orderItemId: order.items[0].id,
              quantity: 1,
              reason: 'Changed mind',
            },
          ],
        })
      ).rejects.toThrow('Can only return delivered orders');
    });
  });
});
