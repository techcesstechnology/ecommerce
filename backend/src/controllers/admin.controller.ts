import { Request, Response } from 'express';
import { adminService } from '../services/admin.service';
import { formatResponse, formatError } from '../utils';

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await adminService.getDashboardStats();
    res.status(200).json(formatResponse(stats, 'Dashboard statistics retrieved successfully'));
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json(formatError('Failed to retrieve dashboard statistics', error));
  }
};

/**
 * Get inventory alerts
 */
export const getInventoryAlerts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const alerts = await adminService.getInventoryAlerts();
    res.status(200).json(formatResponse(alerts, 'Inventory alerts retrieved successfully'));
  } catch (error) {
    console.error('Error getting inventory alerts:', error);
    res.status(500).json(formatError('Failed to retrieve inventory alerts', error));
  }
};

/**
 * Get sales summary
 */
export const getSalesSummary = async (_req: Request, res: Response): Promise<void> => {
  try {
    const summary = await adminService.getSalesSummary();
    res.status(200).json(formatResponse(summary, 'Sales summary retrieved successfully'));
  } catch (error) {
    console.error('Error getting sales summary:', error);
    res.status(500).json(formatError('Failed to retrieve sales summary', error));
  }
};

/**
 * Get comprehensive analytics
 */
export const getAnalytics = async (_req: Request, res: Response): Promise<void> => {
  try {
    const analytics = await adminService.getAnalytics();
    res.status(200).json(formatResponse(analytics, 'Analytics retrieved successfully'));
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json(formatError('Failed to retrieve analytics', error));
  }
};

/**
 * Get sales by category
 */
export const getSalesByCategory = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await adminService.getSalesByCategory();
    res.status(200).json(formatResponse(data, 'Sales by category retrieved successfully'));
  } catch (error) {
    console.error('Error getting sales by category:', error);
    res.status(500).json(formatError('Failed to retrieve sales by category', error));
  }
};

/**
 * Get revenue over time
 */
export const getRevenueOverTime = async (req: Request, res: Response): Promise<void> => {
  try {
    const period = (req.query.period as 'day' | 'week' | 'month') || 'day';
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 30;
    const data = await adminService.getRevenueOverTime(period, limit);
    res.status(200).json(formatResponse(data, 'Revenue over time retrieved successfully'));
  } catch (error) {
    console.error('Error getting revenue over time:', error);
    res.status(500).json(formatError('Failed to retrieve revenue over time', error));
  }
};
