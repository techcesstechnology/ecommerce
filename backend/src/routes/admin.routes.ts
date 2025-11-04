import { Router } from 'express';
import {
  getDashboardStats,
  getInventoryAlerts,
  getSalesSummary,
} from '../controllers/admin.controller';
import { isAdmin } from '../middleware/admin.middleware';

const router = Router();

// All admin routes require authentication
router.use(isAdmin);

// Dashboard endpoints
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/inventory-alerts', getInventoryAlerts);
router.get('/dashboard/sales-summary', getSalesSummary);

export default router;
