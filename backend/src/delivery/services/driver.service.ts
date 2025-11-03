import { v4 as uuidv4 } from 'uuid';
import { Driver, DriverStatus, Location } from '../../types';

// In-memory storage (in production, this would be a database)
class DriverService {
  private drivers: Map<string, Driver> = new Map();

  /**
   * Get all drivers
   */
  getAllDrivers(): Driver[] {
    return Array.from(this.drivers.values());
  }

  /**
   * Get available drivers
   */
  getAvailableDrivers(): Driver[] {
    return Array.from(this.drivers.values()).filter(
      (driver) => driver.isAvailable && driver.status === DriverStatus.AVAILABLE
    );
  }

  /**
   * Get driver by ID
   */
  getDriverById(id: string): Driver | undefined {
    return this.drivers.get(id);
  }

  /**
   * Create a new driver
   */
  createDriver(driverData: Omit<Driver, 'id' | 'createdAt' | 'updatedAt' | 'completedDeliveries' | 'status' | 'isAvailable'>): Driver {
    const driver: Driver = {
      id: uuidv4(),
      ...driverData,
      status: DriverStatus.OFFLINE,
      isAvailable: false,
      completedDeliveries: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.drivers.set(driver.id, driver);
    return driver;
  }

  /**
   * Update driver information
   */
  updateDriver(id: string, updates: Partial<Driver>): Driver | null {
    const driver = this.drivers.get(id);
    if (!driver) {
      return null;
    }

    const updatedDriver = {
      ...driver,
      ...updates,
      id: driver.id, // Prevent ID changes
      createdAt: driver.createdAt, // Prevent createdAt changes
      updatedAt: new Date(),
    };

    this.drivers.set(id, updatedDriver);
    return updatedDriver;
  }

  /**
   * Update driver location
   */
  updateDriverLocation(id: string, location: Location): Driver | null {
    const driver = this.drivers.get(id);
    if (!driver) {
      return null;
    }

    const updatedDriver = {
      ...driver,
      currentLocation: location,
      updatedAt: new Date(),
    };

    this.drivers.set(id, updatedDriver);
    return updatedDriver;
  }

  /**
   * Update driver status
   */
  updateDriverStatus(id: string, status: DriverStatus, isAvailable?: boolean): Driver | null {
    const driver = this.drivers.get(id);
    if (!driver) {
      return null;
    }

    const updatedDriver = {
      ...driver,
      status,
      isAvailable: isAvailable !== undefined ? isAvailable : driver.isAvailable,
      updatedAt: new Date(),
    };

    this.drivers.set(id, updatedDriver);
    return updatedDriver;
  }

  /**
   * Find nearest available driver to a location
   */
  findNearestDriver(location: Location): Driver | null {
    const availableDrivers = this.getAvailableDrivers();
    
    if (availableDrivers.length === 0) {
      return null;
    }

    // Simple distance calculation (in production, use proper geospatial queries)
    let nearestDriver: Driver | null = null;
    let minDistance = Infinity;

    for (const driver of availableDrivers) {
      if (driver.currentLocation) {
        const distance = this.calculateDistance(
          location,
          driver.currentLocation
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearestDriver = driver;
        }
      }
    }

    return nearestDriver;
  }

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
   * Increment driver's completed deliveries
   */
  incrementCompletedDeliveries(id: string): Driver | null {
    const driver = this.drivers.get(id);
    if (!driver) {
      return null;
    }

    const updatedDriver = {
      ...driver,
      completedDeliveries: driver.completedDeliveries + 1,
      updatedAt: new Date(),
    };

    this.drivers.set(id, updatedDriver);
    return updatedDriver;
  }

  /**
   * Delete a driver
   */
  deleteDriver(id: string): boolean {
    return this.drivers.delete(id);
  }
}

export default new DriverService();
