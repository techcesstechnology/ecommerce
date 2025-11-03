import { Request, Response } from 'express';
import deliveryService from '../services/delivery.service';
import trackingService from '../services/tracking.service';
import smsService from '../../notifications/sms.service';
import {
  validateDelivery,
  validateDeliveryStatusUpdate,
  validateTrackingInit,
} from '../validators/delivery.validator';
import { DeliveryStatus } from '../../types';

export class DeliveryController {
  /**
   * GET /api/deliveries - List all deliveries
   */
  async getAllDeliveries(req: Request, res: Response): Promise<void> {
    try {
      const { status, driverId } = req.query;

      let deliveries;
      if (status) {
        deliveries = deliveryService.getDeliveriesByStatus(status as DeliveryStatus);
      } else if (driverId) {
        deliveries = deliveryService.getDeliveriesByDriver(driverId as string);
      } else {
        deliveries = deliveryService.getAllDeliveries();
      }

      res.json({
        success: true,
        count: deliveries.length,
        data: deliveries,
      });
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch deliveries',
      });
    }
  }

  /**
   * GET /api/deliveries/:id - Get delivery by ID
   */
  async getDeliveryById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const delivery = deliveryService.getDeliveryById(id);

      if (!delivery) {
        res.status(404).json({
          success: false,
          message: 'Delivery not found',
        });
        return;
      }

      // Include tracking info
      const currentLocation = trackingService.getCurrentLocation(id);
      const trackingHistory = trackingService.getTrackingHistory(id);

      res.json({
        success: true,
        data: {
          ...delivery,
          currentLocation,
          trackingHistory,
        },
      });
    } catch (error) {
      console.error('Error fetching delivery:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch delivery',
      });
    }
  }

  /**
   * POST /api/deliveries - Create a new delivery
   */
  async createDelivery(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = validateDelivery(req.body);

      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      const delivery = deliveryService.createDelivery(value);

      res.status(201).json({
        success: true,
        message: 'Delivery created successfully',
        data: delivery,
      });
    } catch (error) {
      console.error('Error creating delivery:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create delivery',
      });
    }
  }

  /**
   * PUT /api/deliveries/:id/status - Update delivery status
   */
  async updateDeliveryStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { error, value } = validateDeliveryStatusUpdate(req.body);

      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      const { status, notes } = value;
      const delivery = deliveryService.updateDeliveryStatus(id, status, notes);

      if (!delivery) {
        res.status(404).json({
          success: false,
          message: 'Delivery not found',
        });
        return;
      }

      // Send SMS notifications based on status
      const phone = smsService.formatPhoneNumber(delivery.customerPhone);
      
      switch (status) {
        case DeliveryStatus.ASSIGNED:
          if (delivery.driverId) {
            // Would fetch driver name in real app
            await smsService.notifyDeliveryAssigned(
              phone,
              delivery.id,
              'Driver',
              delivery.estimatedArrival
            );
          }
          break;
        case DeliveryStatus.PICKED_UP:
          await smsService.notifyDeliveryPickedUp(phone, delivery.id);
          break;
        case DeliveryStatus.IN_TRANSIT:
          await smsService.notifyDeliveryInTransit(
            phone,
            delivery.id,
            delivery.estimatedArrival
          );
          break;
        case DeliveryStatus.DELIVERED:
          await smsService.notifyDeliveryCompleted(phone, delivery.id);
          break;
        case DeliveryStatus.FAILED:
          await smsService.notifyDeliveryFailed(phone, delivery.id, notes || 'Unknown reason');
          break;
      }

      res.json({
        success: true,
        message: 'Delivery status updated successfully',
        data: delivery,
      });
    } catch (error) {
      console.error('Error updating delivery status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update delivery status',
      });
    }
  }

  /**
   * POST /api/deliveries/track - Initialize tracking for a delivery
   */
  async initializeTracking(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = validateTrackingInit(req.body);

      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      const { deliveryId } = value;
      const success = trackingService.initializeTracking(deliveryId);

      if (!success) {
        res.status(400).json({
          success: false,
          message: 'Failed to initialize tracking. Delivery may not be assigned to a driver.',
        });
        return;
      }

      const delivery = deliveryService.getDeliveryById(deliveryId);

      res.json({
        success: true,
        message: 'Tracking initialized successfully',
        data: {
          deliveryId,
          trackingUrl: delivery?.trackingUrl,
        },
      });
    } catch (error) {
      console.error('Error initializing tracking:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to initialize tracking',
      });
    }
  }

  /**
   * GET /api/deliveries/:id/tracking - Get tracking information
   */
  async getTrackingInfo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const delivery = deliveryService.getDeliveryById(id);

      if (!delivery) {
        res.status(404).json({
          success: false,
          message: 'Delivery not found',
        });
        return;
      }

      const currentLocation = trackingService.getCurrentLocation(id);
      const trackingHistory = trackingService.getTrackingHistory(id);
      const latestUpdate = trackingService.getLatestUpdate(id);

      res.json({
        success: true,
        data: {
          delivery,
          currentLocation,
          latestUpdate,
          trackingHistory,
        },
      });
    } catch (error) {
      console.error('Error fetching tracking info:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch tracking info',
      });
    }
  }

  /**
   * GET /api/deliveries/pending - Get pending deliveries
   */
  async getPendingDeliveries(req: Request, res: Response): Promise<void> {
    try {
      const deliveries = deliveryService.getPendingDeliveries();

      res.json({
        success: true,
        count: deliveries.length,
        data: deliveries,
      });
    } catch (error) {
      console.error('Error fetching pending deliveries:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch pending deliveries',
      });
    }
  }

  /**
   * GET /api/deliveries/active - Get active deliveries
   */
  async getActiveDeliveries(req: Request, res: Response): Promise<void> {
    try {
      const deliveries = deliveryService.getActiveDeliveries();

      res.json({
        success: true,
        count: deliveries.length,
        data: deliveries,
      });
    } catch (error) {
      console.error('Error fetching active deliveries:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch active deliveries',
      });
    }
  }
}

export default new DeliveryController();
