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
