import { Request, Response } from 'express';
import { productService, CreateProductDto, UpdateProductDto } from '../services/product.service';
import { categoryService } from '../services/category.service';
import { orderService } from '../services/order.service';
import { userService } from '../services/user.service';
import { deliverySlotService } from '../services/delivery-slot.service';
import { promotionService } from '../services/promotion.service';

export class AdminController {
  createProduct = async (req: Request, res: Response): Promise<void> => {
    const productData: CreateProductDto = req.body;
    const product = await productService.createProduct(productData);

    res.status(201).json({
      success: true,
      data: product,
    });
  };

  updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const productData: UpdateProductDto = req.body;

      const product = await productService.updateProduct(id, productData);

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update product',
      });
    }
  };

  deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await productService.deleteProduct(id);

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete product',
      });
    }
  };

  updateProductStock = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { stockQuantity } = req.body;

      const product = await productService.updateProduct(id, { stockQuantity });

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update stock',
      });
    }
  };

  createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const category = await categoryService.createCategory(req.body);

      res.status(201).json({
        success: true,
        data: category,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create category',
      });
    }
  };

  updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const category = await categoryService.updateCategory(id, req.body);

      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update category',
      });
    }
  };

  deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await categoryService.deleteCategory(id);

      res.status(200).json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete category',
      });
    }
  };

  getAllOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const { status, page = 1, limit = 20 } = req.query;

      const filters: any = {};
      if (status) filters.status = status as string;

      const result = await orderService.getOrders({
        ...filters,
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch orders',
      });
    }
  };

  updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const order = await orderService.updateOrder(id, { status });

      if (!order) {
        res.status(404).json({
          success: false,
          error: 'Order not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update order status',
      });
    }
  };

  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { role, isActive, page = 1, limit = 50 } = req.query;

      const filters: any = {};
      if (role) filters.role = role as string;
      if (isActive !== undefined) filters.isActive = isActive === 'true';

      const result = await userService.getUsers({
        ...filters,
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch users',
      });
    }
  };

  updateUserRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      const user = await userService.updateUser(id, { role } as any);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user role',
      });
    }
  };

  deactivateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await userService.updateUser(id, { isActive: false });

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to deactivate user',
      });
    }
  };

  createDeliverySlot = async (req: Request, res: Response): Promise<void> => {
    try {
      const slot = await deliverySlotService.createSlot(req.body);

      res.status(201).json({
        success: true,
        data: slot,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create delivery slot',
      });
    }
  };

  updateDeliverySlot = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const slot = await deliverySlotService.updateSlot(id, req.body);

      res.status(200).json({
        success: true,
        data: slot,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update delivery slot',
      });
    }
  };

  deleteDeliverySlot = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await deliverySlotService.deleteSlot(id);

      res.status(200).json({
        success: true,
        message: 'Delivery slot deleted successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete delivery slot',
      });
    }
  };

  getDeliverySlot = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const slot = await deliverySlotService.getSlotById(id);

    res.status(200).json({
      success: true,
      data: slot,
    });
  };

  getAllDeliverySlots = async (req: Request, res: Response): Promise<void> => {
    try {
      const { date, isActive, startDate, endDate } = req.query;

      const filters: any = {};
      if (date) filters.date = new Date(date as string);
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const slots = await deliverySlotService.getAllSlots(filters);

      res.status(200).json({
        success: true,
        data: slots,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch delivery slots',
      });
    }
  };

  createPromotion = async (req: Request, res: Response): Promise<void> => {
    try {
      const promotion = await promotionService.createPromotion(req.body);

      res.status(201).json({
        success: true,
        data: promotion,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create promotion',
      });
    }
  };

  updatePromotion = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const promotion = await promotionService.updatePromotion(id, req.body);

      res.status(200).json({
        success: true,
        data: promotion,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update promotion',
      });
    }
  };

  deletePromotion = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await promotionService.deletePromotion(id);

      res.status(200).json({
        success: true,
        message: 'Promotion deleted successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete promotion',
      });
    }
  };

  getPromotion = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const promotion = await promotionService.getPromotionById(id);

    res.status(200).json({
      success: true,
      data: promotion,
    });
  };

  getAllPromotions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { isActive, type, current } = req.query;

      const filters: any = {};
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      if (type) filters.type = type as string;
      if (current !== undefined) filters.current = current === 'true';

      const promotions = await promotionService.getAllPromotions(filters);

      res.status(200).json({
        success: true,
        data: promotions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch promotions',
      });
    }
  };

  getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
    try {
      const stats = await orderService.getOrderStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch dashboard statistics',
      });
    }
  };
}

export const adminController = new AdminController();
