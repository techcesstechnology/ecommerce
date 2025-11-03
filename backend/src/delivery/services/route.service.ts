import { v4 as uuidv4 } from 'uuid';
import { Route, Location, Delivery } from '../../types';
import deliveryService from './delivery.service';
import driverService from './driver.service';

class RouteService {
  private routes: Map<string, Route> = new Map();

  /**
   * Calculate distance between two locations (Haversine formula)
   */
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

  /**
   * Optimize route using nearest neighbor algorithm
   * This is a simple greedy algorithm. In production, use more sophisticated algorithms
   * like genetic algorithms or Google Maps Directions API
   */
  optimizeRoute(driverId: string, deliveryIds: string[]): Route | null {
    const driver = driverService.getDriverById(driverId);
    if (!driver || !driver.currentLocation) {
      return null;
    }

    const deliveries: Delivery[] = [];
    for (const id of deliveryIds) {
      const delivery = deliveryService.getDeliveryById(id);
      if (delivery) {
        deliveries.push(delivery);
      }
    }

    if (deliveries.length === 0) {
      return null;
    }

    // Start from driver's current location
    const waypoints: Location[] = [driver.currentLocation];
    const orderedDeliveries: string[] = [];
    let currentLocation = driver.currentLocation;
    let totalDistance = 0;
    const remainingDeliveries = [...deliveries];

    // Nearest neighbor algorithm
    while (remainingDeliveries.length > 0) {
      let nearestIndex = 0;
      let minDistance = Infinity;

      for (let i = 0; i < remainingDeliveries.length; i++) {
        const distance = this.calculateDistance(
          currentLocation,
          remainingDeliveries[i].deliveryLocation.coordinates
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = i;
        }
      }

      const nextDelivery = remainingDeliveries[nearestIndex];
      orderedDeliveries.push(nextDelivery.id);
      waypoints.push(nextDelivery.deliveryLocation.coordinates);
      totalDistance += minDistance;
      currentLocation = nextDelivery.deliveryLocation.coordinates;
      remainingDeliveries.splice(nearestIndex, 1);
    }

    // Estimate duration (assuming average speed of 40 km/h in Zimbabwe cities)
    const estimatedDuration = (totalDistance / 40) * 60; // in minutes

    const route: Route = {
      id: uuidv4(),
      driverId,
      deliveries: orderedDeliveries,
      waypoints,
      totalDistance,
      estimatedDuration,
      optimized: true,
      createdAt: new Date(),
    };

    this.routes.set(route.id, route);
    return route;
  }

  /**
   * Get route by ID
   */
  getRouteById(id: string): Route | undefined {
    return this.routes.get(id);
  }

  /**
   * Get routes by driver ID
   */
  getRoutesByDriver(driverId: string): Route[] {
    return Array.from(this.routes.values()).filter(
      (route) => route.driverId === driverId
    );
  }

  /**
   * Get optimized routes for pending deliveries
   * Groups deliveries by proximity and assigns to available drivers
   */
  generateOptimizedRoutes(): Route[] {
    const availableDrivers = driverService.getAvailableDrivers();
    const pendingDeliveries = deliveryService.getPendingDeliveries();

    if (availableDrivers.length === 0 || pendingDeliveries.length === 0) {
      return [];
    }

    const routes: Route[] = [];
    const deliveriesPerDriver = Math.ceil(pendingDeliveries.length / availableDrivers.length);

    // Simple distribution: assign deliveries to nearest drivers
    for (const driver of availableDrivers) {
      if (pendingDeliveries.length === 0) break;

      const driverDeliveries = pendingDeliveries
        .splice(0, Math.min(deliveriesPerDriver, pendingDeliveries.length))
        .map((d) => d.id);

      const route = this.optimizeRoute(driver.id, driverDeliveries);
      if (route) {
        routes.push(route);
      }
    }

    return routes;
  }

  /**
   * Calculate ETA for a delivery based on route
   */
  calculateETA(routeId: string, deliveryId: string): Date | null {
    const route = this.routes.get(routeId);
    if (!route) {
      return null;
    }

    const deliveryIndex = route.deliveries.indexOf(deliveryId);
    if (deliveryIndex === -1) {
      return null;
    }

    // Calculate distance to this delivery
    let distanceToDelivery = 0;
    for (let i = 0; i < deliveryIndex; i++) {
      distanceToDelivery += this.calculateDistance(
        route.waypoints[i],
        route.waypoints[i + 1]
      );
    }

    // Estimate time (40 km/h average speed)
    const timeInMinutes = (distanceToDelivery / 40) * 60;
    const eta = new Date();
    eta.setMinutes(eta.getMinutes() + timeInMinutes);

    return eta;
  }
}

export default new RouteService();
