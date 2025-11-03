import driverService from '../driver.service';
import { DriverStatus } from '../../../types';

describe('DriverService', () => {
  beforeEach(() => {
    // Clear all drivers before each test
    const drivers = driverService.getAllDrivers();
    drivers.forEach((driver) => driverService.deleteDriver(driver.id));
  });

  describe('createDriver', () => {
    it('should create a new driver', () => {
      const driverData = {
        name: 'John Doe',
        phone: '+263771234567',
        email: 'john@example.com',
        vehicleType: 'car',
        vehicleNumber: 'ABC1234',
      };

      const driver = driverService.createDriver(driverData);

      expect(driver).toBeDefined();
      expect(driver.id).toBeDefined();
      expect(driver.name).toBe(driverData.name);
      expect(driver.phone).toBe(driverData.phone);
      expect(driver.status).toBe(DriverStatus.OFFLINE);
      expect(driver.isAvailable).toBe(false);
      expect(driver.completedDeliveries).toBe(0);
    });
  });

  describe('getAllDrivers', () => {
    it('should return all drivers', () => {
      const driverData1 = {
        name: 'John Doe',
        phone: '+263771234567',
        email: 'john@example.com',
        vehicleType: 'car',
        vehicleNumber: 'ABC1234',
      };

      const driverData2 = {
        name: 'Jane Smith',
        phone: '+263779876543',
        email: 'jane@example.com',
        vehicleType: 'motorcycle',
        vehicleNumber: 'XYZ5678',
      };

      driverService.createDriver(driverData1);
      driverService.createDriver(driverData2);

      const drivers = driverService.getAllDrivers();
      expect(drivers).toHaveLength(2);
    });
  });

  describe('getAvailableDrivers', () => {
    it('should return only available drivers', () => {
      const driver1Data = {
        name: 'John Doe',
        phone: '+263771234567',
        email: 'john@example.com',
        vehicleType: 'car',
        vehicleNumber: 'ABC1234',
      };

      const driver2Data = {
        name: 'Jane Smith',
        phone: '+263779876543',
        email: 'jane@example.com',
        vehicleType: 'motorcycle',
        vehicleNumber: 'XYZ5678',
      };

      const driver1 = driverService.createDriver(driver1Data);
      const driver2 = driverService.createDriver(driver2Data);

      // Make driver1 available
      driverService.updateDriverStatus(driver1.id, DriverStatus.AVAILABLE, true);

      const availableDrivers = driverService.getAvailableDrivers();
      expect(availableDrivers).toHaveLength(1);
      expect(availableDrivers[0].id).toBe(driver1.id);
    });
  });

  describe('updateDriverLocation', () => {
    it('should update driver location', () => {
      const driverData = {
        name: 'John Doe',
        phone: '+263771234567',
        email: 'john@example.com',
        vehicleType: 'car',
        vehicleNumber: 'ABC1234',
      };

      const driver = driverService.createDriver(driverData);
      const location = {
        latitude: -17.8252,
        longitude: 31.0335,
        timestamp: new Date(),
      };

      const updatedDriver = driverService.updateDriverLocation(driver.id, location);

      expect(updatedDriver).toBeDefined();
      expect(updatedDriver?.currentLocation?.latitude).toBe(location.latitude);
      expect(updatedDriver?.currentLocation?.longitude).toBe(location.longitude);
    });
  });

  describe('updateDriverStatus', () => {
    it('should update driver status', () => {
      const driverData = {
        name: 'John Doe',
        phone: '+263771234567',
        email: 'john@example.com',
        vehicleType: 'car',
        vehicleNumber: 'ABC1234',
      };

      const driver = driverService.createDriver(driverData);
      const updatedDriver = driverService.updateDriverStatus(
        driver.id,
        DriverStatus.AVAILABLE,
        true
      );

      expect(updatedDriver).toBeDefined();
      expect(updatedDriver?.status).toBe(DriverStatus.AVAILABLE);
      expect(updatedDriver?.isAvailable).toBe(true);
    });
  });

  describe('findNearestDriver', () => {
    it('should find the nearest available driver', () => {
      const driver1Data = {
        name: 'John Doe',
        phone: '+263771234567',
        email: 'john@example.com',
        vehicleType: 'car',
        vehicleNumber: 'ABC1234',
      };

      const driver2Data = {
        name: 'Jane Smith',
        phone: '+263779876543',
        email: 'jane@example.com',
        vehicleType: 'motorcycle',
        vehicleNumber: 'XYZ5678',
      };

      const driver1 = driverService.createDriver(driver1Data);
      const driver2 = driverService.createDriver(driver2Data);

      // Set locations
      driverService.updateDriverLocation(driver1.id, {
        latitude: -17.8252,
        longitude: 31.0335,
        timestamp: new Date(),
      });

      driverService.updateDriverLocation(driver2.id, {
        latitude: -17.8300,
        longitude: 31.0400,
        timestamp: new Date(),
      });

      // Make both available
      driverService.updateDriverStatus(driver1.id, DriverStatus.AVAILABLE, true);
      driverService.updateDriverStatus(driver2.id, DriverStatus.AVAILABLE, true);

      // Find nearest to a location closer to driver1
      const targetLocation = {
        latitude: -17.8260,
        longitude: 31.0340,
        timestamp: new Date(),
      };

      const nearestDriver = driverService.findNearestDriver(targetLocation);

      expect(nearestDriver).toBeDefined();
      expect(nearestDriver?.id).toBe(driver1.id);
    });

    it('should return null when no drivers are available', () => {
      const targetLocation = {
        latitude: -17.8260,
        longitude: 31.0340,
        timestamp: new Date(),
      };

      const nearestDriver = driverService.findNearestDriver(targetLocation);
      expect(nearestDriver).toBeNull();
    });
  });

  describe('incrementCompletedDeliveries', () => {
    it('should increment completed deliveries count', () => {
      const driverData = {
        name: 'John Doe',
        phone: '+263771234567',
        email: 'john@example.com',
        vehicleType: 'car',
        vehicleNumber: 'ABC1234',
      };

      const driver = driverService.createDriver(driverData);
      expect(driver.completedDeliveries).toBe(0);

      const updatedDriver = driverService.incrementCompletedDeliveries(driver.id);
      expect(updatedDriver?.completedDeliveries).toBe(1);

      driverService.incrementCompletedDeliveries(driver.id);
      const finalDriver = driverService.getDriverById(driver.id);
      expect(finalDriver?.completedDeliveries).toBe(2);
    });
  });
});
