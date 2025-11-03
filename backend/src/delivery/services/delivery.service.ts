import { v4 as uuidv4 } from 'uuid';
import { Delivery, DeliveryStatus } from '../../types';
import driverService from './driver.service';
import { DriverStatus } from '../../types';

class DeliveryService {
  private deliveries: Map<string, Delivery> = new Map();

  /**
   * Get all deliveries
   */
  getAllDeliveries(): Delivery[] {
    return Array.from(this.deliveries.values());
  }

  /**
   * Get delivery by ID
   */
  getDeliveryById(id: string): Delivery | undefined {
    return this.deliveries.get(id);
  }

  /**
   * Get deliveries by driver ID
   */
  getDeliveriesByDriver(driverId: string): Delivery[] {
    return Array.from(this.deliveries.values()).filter(
      (delivery) => delivery.driverId === driverId
    );
  }

  /**
   * Get deliveries by status
   */
  getDeliveriesByStatus(status: DeliveryStatus): Delivery[] {
    return Array.from(this.deliveries.values()).filter(
      (delivery) => delivery.status === status
    );
  }

  /**
   * Get pending deliveries
   */
  getPendingDeliveries(): Delivery[] {
    return this.getDeliveriesByStatus(DeliveryStatus.PENDING);
  }

  /**
   * Create a new delivery
   */
  createDelivery(deliveryData: Omit<Delivery, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'trackingUrl'>): Delivery {
    const delivery: Delivery = {
      id: uuidv4(),
      ...deliveryData,
      status: DeliveryStatus.PENDING,
      trackingUrl: `/track/${uuidv4()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.deliveries.set(delivery.id, delivery);
    return delivery;
  }

  /**
   * Assign driver to delivery
   */
  assignDriver(deliveryId: string, driverId: string): Delivery | null {
    const delivery = this.deliveries.get(deliveryId);
    if (!delivery) {
      return null;
    }

    const driver = driverService.getDriverById(driverId);
    if (!driver || !driver.isAvailable) {
      return null;
    }

    const updatedDelivery = {
      ...delivery,
      driverId,
      status: DeliveryStatus.ASSIGNED,
      assignedAt: new Date(),
      updatedAt: new Date(),
    };

    this.deliveries.set(deliveryId, updatedDelivery);

    // Update driver status
    driverService.updateDriverStatus(driverId, DriverStatus.ON_DELIVERY, false);

    return updatedDelivery;
  }

  /**
   * Update delivery status
   */
  updateDeliveryStatus(id: string, status: DeliveryStatus, notes?: string): Delivery | null {
    const delivery = this.deliveries.get(id);
    if (!delivery) {
      return null;
    }

    const updates: Partial<Delivery> = {
      status,
      notes: notes || delivery.notes,
      updatedAt: new Date(),
    };

    // Set completion time if delivered
    if (status === DeliveryStatus.DELIVERED) {
      updates.completedAt = new Date();
      updates.actualArrival = new Date();

      // Update driver stats and make available
      if (delivery.driverId) {
        driverService.incrementCompletedDeliveries(delivery.driverId);
        driverService.updateDriverStatus(delivery.driverId, DriverStatus.AVAILABLE, true);
      }
    }

    // Handle failed or cancelled deliveries
    if (status === DeliveryStatus.FAILED || status === DeliveryStatus.CANCELLED) {
      updates.completedAt = new Date();
      if (delivery.driverId) {
        driverService.updateDriverStatus(delivery.driverId, DriverStatus.AVAILABLE, true);
      }
    }

    const updatedDelivery = {
      ...delivery,
      ...updates,
    };

    this.deliveries.set(id, updatedDelivery);
    return updatedDelivery;
  }

  /**
   * Update estimated arrival time
   */
  updateEstimatedArrival(id: string, estimatedArrival: Date): Delivery | null {
    const delivery = this.deliveries.get(id);
    if (!delivery) {
      return null;
    }

    const updatedDelivery = {
      ...delivery,
      estimatedArrival,
      updatedAt: new Date(),
    };

    this.deliveries.set(id, updatedDelivery);
    return updatedDelivery;
  }

  /**
   * Get active deliveries (assigned, picked_up, in_transit)
   */
  getActiveDeliveries(): Delivery[] {
    return Array.from(this.deliveries.values()).filter(
      (delivery) =>
        delivery.status === DeliveryStatus.ASSIGNED ||
        delivery.status === DeliveryStatus.PICKED_UP ||
        delivery.status === DeliveryStatus.IN_TRANSIT
    );
  }

  /**
   * Delete a delivery
   */
  deleteDelivery(id: string): boolean {
    return this.deliveries.delete(id);
  }
}

export default new DeliveryService();
