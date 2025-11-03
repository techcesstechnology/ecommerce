import { Server, Socket } from 'socket.io';
import { Location, DeliveryStatus, DriverStatus } from '../types';
import trackingService from '../delivery/services/tracking.service';
import deliveryService from '../delivery/services/delivery.service';
import driverService from '../delivery/services/driver.service';

export class LocationHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  /**
   * Initialize WebSocket handlers
   */
  initialize(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Driver location update
      socket.on('driver:location:update', this.handleDriverLocationUpdate.bind(this, socket));

      // Customer tracking subscription
      socket.on('delivery:track', this.handleDeliveryTracking.bind(this, socket));

      // Driver status update
      socket.on('driver:status:update', this.handleDriverStatusUpdate.bind(this, socket));

      // Delivery status update
      socket.on('delivery:status:update', this.handleDeliveryStatusUpdate.bind(this, socket));

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }

  /**
   * Handle driver location update
   */
  private handleDriverLocationUpdate(socket: Socket, data: {
    driverId: string;
    location: Location;
    deliveryId?: string;
  }): void {
    try {
      const { driverId, location, deliveryId } = data;

      // Update driver location
      const driver = driverService.updateDriverLocation(driverId, location);
      if (!driver) {
        socket.emit('error', { message: 'Driver not found' });
        return;
      }

      // If a delivery is active, add tracking update
      if (deliveryId) {
        const delivery = deliveryService.getDeliveryById(deliveryId);
        if (delivery) {
          trackingService.addTrackingUpdate(
            deliveryId,
            driverId,
            location,
            delivery.status,
            delivery.estimatedArrival
          );

          // Broadcast location update to customers tracking this delivery
          this.io.to(`delivery:${deliveryId}`).emit('location:update', {
            deliveryId,
            location,
            timestamp: new Date(),
          });
        }
      }

      socket.emit('driver:location:updated', { success: true });
    } catch (error) {
      console.error('Error handling driver location update:', error);
      socket.emit('error', { message: 'Failed to update location' });
    }
  }

  /**
   * Handle customer tracking subscription
   */
  private handleDeliveryTracking(socket: Socket, data: { deliveryId: string }): void {
    try {
      const { deliveryId } = data;

      const delivery = deliveryService.getDeliveryById(deliveryId);
      if (!delivery) {
        socket.emit('error', { message: 'Delivery not found' });
        return;
      }

      // Join delivery-specific room
      socket.join(`delivery:${deliveryId}`);

      // Send current status
      const currentLocation = trackingService.getCurrentLocation(deliveryId);
      const trackingHistory = trackingService.getTrackingHistory(deliveryId);

      socket.emit('delivery:tracking:data', {
        delivery,
        currentLocation,
        trackingHistory,
      });

      console.log(`Client ${socket.id} subscribed to delivery ${deliveryId}`);
    } catch (error) {
      console.error('Error handling delivery tracking:', error);
      socket.emit('error', { message: 'Failed to subscribe to tracking' });
    }
  }

  /**
   * Handle driver status update
   */
  private handleDriverStatusUpdate(socket: Socket, data: {
    driverId: string;
    status: string;
    isAvailable: boolean;
  }): void {
    try {
      const { driverId, status, isAvailable } = data;

      // Validate status is a valid DriverStatus enum value
      const validStatuses = ['available', 'on_delivery', 'offline', 'break'];
      if (!validStatuses.includes(status)) {
        socket.emit('error', { message: 'Invalid driver status' });
        return;
      }

      const driver = driverService.updateDriverStatus(
        driverId,
        status as unknown as DriverStatus,
        isAvailable
      );

      if (!driver) {
        socket.emit('error', { message: 'Driver not found' });
        return;
      }

      socket.emit('driver:status:updated', { success: true, driver });

      // Broadcast to admin/dashboard
      this.io.to('admin').emit('driver:status:changed', { driver });
    } catch (error) {
      console.error('Error handling driver status update:', error);
      socket.emit('error', { message: 'Failed to update status' });
    }
  }

  /**
   * Handle delivery status update
   */
  private handleDeliveryStatusUpdate(socket: Socket, data: {
    deliveryId: string;
    status: DeliveryStatus;
    notes?: string;
  }): void {
    try {
      const { deliveryId, status, notes } = data;

      const delivery = deliveryService.updateDeliveryStatus(deliveryId, status, notes);
      if (!delivery) {
        socket.emit('error', { message: 'Delivery not found' });
        return;
      }

      socket.emit('delivery:status:updated', { success: true, delivery });

      // Broadcast to customers tracking this delivery
      this.io.to(`delivery:${deliveryId}`).emit('status:update', {
        deliveryId,
        status,
        timestamp: new Date(),
      });

      // Broadcast to admin/dashboard
      this.io.to('admin').emit('delivery:status:changed', { delivery });
    } catch (error) {
      console.error('Error handling delivery status update:', error);
      socket.emit('error', { message: 'Failed to update status' });
    }
  }

  /**
   * Broadcast location update to all tracking clients
   */
  broadcastLocationUpdate(deliveryId: string, location: Location): void {
    this.io.to(`delivery:${deliveryId}`).emit('location:update', {
      deliveryId,
      location,
      timestamp: new Date(),
    });
  }

  /**
   * Broadcast status update to all tracking clients
   */
  broadcastStatusUpdate(deliveryId: string, status: DeliveryStatus): void {
    this.io.to(`delivery:${deliveryId}`).emit('status:update', {
      deliveryId,
      status,
      timestamp: new Date(),
    });
  }
}
