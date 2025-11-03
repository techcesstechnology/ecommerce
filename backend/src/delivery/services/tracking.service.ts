import { TrackingUpdate, Location, DeliveryStatus } from '../../types';
import deliveryService from './delivery.service';
import driverService from './driver.service';

class TrackingService {
  private trackingUpdates: Map<string, TrackingUpdate[]> = new Map();

  /**
   * Initialize tracking for a delivery
   */
  initializeTracking(deliveryId: string): boolean {
    const delivery = deliveryService.getDeliveryById(deliveryId);
    if (!delivery || !delivery.driverId) {
      return false;
    }

    if (!this.trackingUpdates.has(deliveryId)) {
      this.trackingUpdates.set(deliveryId, []);
    }

    return true;
  }

  /**
   * Add tracking update
   */
  addTrackingUpdate(
    deliveryId: string,
    driverId: string,
    location: Location,
    status: DeliveryStatus,
    estimatedArrival?: Date
  ): TrackingUpdate {
    const update: TrackingUpdate = {
      deliveryId,
      driverId,
      location,
      status,
      estimatedArrival,
      timestamp: new Date(),
    };

    const updates = this.trackingUpdates.get(deliveryId) || [];
    updates.push(update);
    this.trackingUpdates.set(deliveryId, updates);

    // Update driver location
    driverService.updateDriverLocation(driverId, location);

    return update;
  }

  /**
   * Get tracking history for a delivery
   */
  getTrackingHistory(deliveryId: string): TrackingUpdate[] {
    return this.trackingUpdates.get(deliveryId) || [];
  }

  /**
   * Get latest tracking update for a delivery
   */
  getLatestUpdate(deliveryId: string): TrackingUpdate | null {
    const updates = this.trackingUpdates.get(deliveryId);
    if (!updates || updates.length === 0) {
      return null;
    }
    return updates[updates.length - 1];
  }

  /**
   * Get current location of delivery
   */
  getCurrentLocation(deliveryId: string): Location | null {
    const delivery = deliveryService.getDeliveryById(deliveryId);
    if (!delivery || !delivery.driverId) {
      return null;
    }

    const driver = driverService.getDriverById(delivery.driverId);
    return driver?.currentLocation || null;
  }

  /**
   * Get all active tracking sessions
   */
  getActiveTrackingSessions(): string[] {
    const activeDeliveries = deliveryService.getActiveDeliveries();
    return activeDeliveries.map((d) => d.id);
  }

  /**
   * Clean up old tracking data (for completed deliveries older than 30 days)
   */
  cleanupOldTrackingData(): number {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let cleaned = 0;
    for (const [deliveryId] of this.trackingUpdates.entries()) {
      const delivery = deliveryService.getDeliveryById(deliveryId);
      if (
        delivery &&
        delivery.completedAt &&
        delivery.completedAt < thirtyDaysAgo
      ) {
        this.trackingUpdates.delete(deliveryId);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Calculate distance covered by driver for a delivery
   */
  calculateDistanceCovered(deliveryId: string): number {
    const updates = this.trackingUpdates.get(deliveryId);
    if (!updates || updates.length < 2) {
      return 0;
    }

    let totalDistance = 0;
    for (let i = 1; i < updates.length; i++) {
      totalDistance += this.calculateDistance(
        updates[i - 1].location,
        updates[i].location
      );
    }

    return totalDistance;
  }

  private calculateDistance(loc1: Location, loc2: Location): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(loc2.latitude - loc1.latitude);
    const dLon = this.toRad(loc2.longitude - loc1.longitude);
    const lat1 = this.toRad(loc1.latitude);
    const lat2 = this.toRad(loc2.latitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export default new TrackingService();
