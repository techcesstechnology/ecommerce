import { Router } from 'express';
import {
  getDashboardStats,
  getInventoryAlerts,
  getSalesSummary,
  getAnalytics,
  getSalesByCategory,
  getRevenueOverTime,
} from '../controllers/admin.controller';
import { isAdmin } from '../middleware/admin.middleware';

const router = Router();

// All admin routes require authentication
router.use(isAdmin);

// Dashboard endpoints
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/inventory-alerts', getInventoryAlerts);
router.get('/dashboard/sales-summary', getSalesSummary);

// Analytics endpoints
router.get('/analytics', getAnalytics);
router.get('/analytics/sales-by-category', getSalesByCategory);
router.get('/analytics/revenue-over-time', getRevenueOverTime);

export default router;
