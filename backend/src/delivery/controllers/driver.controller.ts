import { Request, Response } from 'express';
import driverService from '../services/driver.service';
import routeService from '../services/route.service';
import {
  validateDriver,
  validateDriverUpdate,
  validateLocationUpdate,
  validateDriverAssignment,
} from '../validators/driver.validator';
import deliveryService from '../services/delivery.service';

export class DriverController {
  /**
   * GET /api/drivers - List all drivers
   */
  async getAllDrivers(req: Request, res: Response): Promise<void> {
    try {
      const { available } = req.query;

      let drivers;
      if (available === 'true') {
        drivers = driverService.getAvailableDrivers();
      } else {
        drivers = driverService.getAllDrivers();
      }

      res.json({
        success: true,
        count: drivers.length,
        data: drivers,
      });
    } catch (error) {
      console.error('Error fetching drivers:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch drivers',
      });
    }
  }

  /**
   * GET /api/drivers/:id - Get driver by ID
   */
  async getDriverById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const driver = driverService.getDriverById(id);

      if (!driver) {
        res.status(404).json({
          success: false,
          message: 'Driver not found',
        });
        return;
      }

      res.json({
        success: true,
        data: driver,
      });
    } catch (error) {
      console.error('Error fetching driver:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch driver',
      });
    }
  }

  /**
   * POST /api/drivers - Create a new driver
   */
  async createDriver(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = validateDriver(req.body);

      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      const driver = driverService.createDriver(value);

      res.status(201).json({
        success: true,
        message: 'Driver created successfully',
        data: driver,
      });
    } catch (error) {
      console.error('Error creating driver:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create driver',
      });
    }
  }

  /**
   * PUT /api/drivers/:id - Update driver
   */
  async updateDriver(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { error, value } = validateDriverUpdate(req.body);

      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      const driver = driverService.updateDriver(id, value);

      if (!driver) {
        res.status(404).json({
          success: false,
          message: 'Driver not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Driver updated successfully',
        data: driver,
      });
    } catch (error) {
      console.error('Error updating driver:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update driver',
      });
    }
  }

  /**
   * PUT /api/drivers/location - Update driver location
   */
  async updateDriverLocation(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = validateLocationUpdate(req.body);

      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      const { driverId, location } = value;
      const driver = driverService.updateDriverLocation(driverId, {
        ...location,
        timestamp: new Date(),
      });

      if (!driver) {
        res.status(404).json({
          success: false,
          message: 'Driver not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Driver location updated successfully',
        data: driver,
      });
    } catch (error) {
      console.error('Error updating driver location:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update driver location',
      });
    }
  }

  /**
   * POST /api/drivers/assign - Assign driver to delivery
   */
  async assignDriver(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = validateDriverAssignment(req.body);

      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      const { driverId, deliveryId } = value;
      const delivery = deliveryService.assignDriver(deliveryId, driverId);

      if (!delivery) {
        res.status(400).json({
          success: false,
          message: 'Failed to assign driver. Driver may not be available or delivery not found.',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Driver assigned successfully',
        data: delivery,
      });
    } catch (error) {
      console.error('Error assigning driver:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to assign driver',
      });
    }
  }

  /**
   * GET /api/drivers/routes - Get optimized routes
   */
  async getOptimizedRoutes(req: Request, res: Response): Promise<void> {
    try {
      const { driverId, deliveryIds } = req.query;

      if (driverId && deliveryIds) {
        // Get route for specific driver and deliveries
        const ids = (deliveryIds as string).split(',');
        const route = routeService.optimizeRoute(driverId as string, ids);

        if (!route) {
          res.status(400).json({
            success: false,
            message: 'Failed to optimize route. Driver may not have a current location.',
          });
          return;
        }

        res.json({
          success: true,
          data: route,
        });
      } else {
        // Generate routes for all pending deliveries
        const routes = routeService.generateOptimizedRoutes();

        res.json({
          success: true,
          count: routes.length,
          data: routes,
        });
      }
    } catch (error) {
      console.error('Error getting optimized routes:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get optimized routes',
      });
    }
  }

  /**
   * GET /api/drivers/:id/deliveries - Get driver's deliveries
   */
  async getDriverDeliveries(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const driver = driverService.getDriverById(id);

      if (!driver) {
        res.status(404).json({
          success: false,
          message: 'Driver not found',
        });
        return;
      }

      const deliveries = deliveryService.getDeliveriesByDriver(id);

      res.json({
        success: true,
        count: deliveries.length,
        data: deliveries,
      });
    } catch (error) {
      console.error('Error fetching driver deliveries:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch driver deliveries',
      });
    }
  }
}

export default new DriverController();
