import deliveryService from '../delivery.service';
import driverService from '../driver.service';
import { DeliveryStatus, DriverStatus } from '../../../types';

describe('DeliveryService', () => {
  beforeEach(() => {
    // Clear all deliveries and drivers before each test
    const deliveries = deliveryService.getAllDeliveries();
    deliveries.forEach((delivery) => deliveryService.deleteDelivery(delivery.id));

    const drivers = driverService.getAllDrivers();
    drivers.forEach((driver) => driverService.deleteDriver(driver.id));
  });

  describe('createDelivery', () => {
    it('should create a new delivery', () => {
      const deliveryData = {
        orderId: '550e8400-e29b-41d4-a716-446655440000',
        customerName: 'John Customer',
        customerPhone: '+263771234567',
        pickupLocation: {
          street: '123 Main Street',
          city: 'Harare',
          province: 'Harare',
          coordinates: {
            latitude: -17.8252,
            longitude: 31.0335,
            timestamp: new Date(),
          },
        },
        deliveryLocation: {
          street: '456 Delivery Street',
          city: 'Harare',
          province: 'Harare',
          coordinates: {
            latitude: -17.8300,
            longitude: 31.0400,
            timestamp: new Date(),
          },
        },
        notes: 'Please call on arrival',
      };

      const delivery = deliveryService.createDelivery(deliveryData);

      expect(delivery).toBeDefined();
      expect(delivery.id).toBeDefined();
      expect(delivery.orderId).toBe(deliveryData.orderId);
      expect(delivery.status).toBe(DeliveryStatus.PENDING);
      expect(delivery.trackingUrl).toBeDefined();
    });
  });

  describe('assignDriver', () => {
    it('should assign an available driver to a delivery', () => {
      const driverData = {
        name: 'John Driver',
        phone: '+263771234567',
        email: 'driver@example.com',
        vehicleType: 'car',
        vehicleNumber: 'ABC1234',
      };

      const driver = driverService.createDriver(driverData);
      driverService.updateDriverStatus(driver.id, DriverStatus.AVAILABLE, true);

      const deliveryData = {
        orderId: '550e8400-e29b-41d4-a716-446655440000',
        customerName: 'John Customer',
        customerPhone: '+263771234567',
        pickupLocation: {
          street: '123 Main Street',
          city: 'Harare',
          province: 'Harare',
          coordinates: {
            latitude: -17.8252,
            longitude: 31.0335,
            timestamp: new Date(),
          },
        },
        deliveryLocation: {
          street: '456 Delivery Street',
          city: 'Harare',
          province: 'Harare',
          coordinates: {
            latitude: -17.8300,
            longitude: 31.0400,
            timestamp: new Date(),
          },
        },
      };

      const delivery = deliveryService.createDelivery(deliveryData);
      const assignedDelivery = deliveryService.assignDriver(delivery.id, driver.id);

      expect(assignedDelivery).toBeDefined();
      expect(assignedDelivery?.driverId).toBe(driver.id);
      expect(assignedDelivery?.status).toBe(DeliveryStatus.ASSIGNED);
      expect(assignedDelivery?.assignedAt).toBeDefined();

      // Check driver status updated
      const updatedDriver = driverService.getDriverById(driver.id);
      expect(updatedDriver?.status).toBe(DriverStatus.ON_DELIVERY);
      expect(updatedDriver?.isAvailable).toBe(false);
    });

    it('should not assign unavailable driver', () => {
      const driverData = {
        name: 'John Driver',
        phone: '+263771234567',
        email: 'driver@example.com',
        vehicleType: 'car',
        vehicleNumber: 'ABC1234',
      };

      const driver = driverService.createDriver(driverData);
      // Driver is offline and unavailable

      const deliveryData = {
        orderId: '550e8400-e29b-41d4-a716-446655440000',
        customerName: 'John Customer',
        customerPhone: '+263771234567',
        pickupLocation: {
          street: '123 Main Street',
          city: 'Harare',
          province: 'Harare',
          coordinates: {
            latitude: -17.8252,
            longitude: 31.0335,
            timestamp: new Date(),
          },
        },
        deliveryLocation: {
          street: '456 Delivery Street',
          city: 'Harare',
          province: 'Harare',
          coordinates: {
            latitude: -17.8300,
            longitude: 31.0400,
            timestamp: new Date(),
          },
        },
      };

      const delivery = deliveryService.createDelivery(deliveryData);
      const assignedDelivery = deliveryService.assignDriver(delivery.id, driver.id);

      expect(assignedDelivery).toBeNull();
    });
  });

  describe('updateDeliveryStatus', () => {
    it('should update delivery status', () => {
      const deliveryData = {
        orderId: '550e8400-e29b-41d4-a716-446655440000',
        customerName: 'John Customer',
        customerPhone: '+263771234567',
        pickupLocation: {
          street: '123 Main Street',
          city: 'Harare',
          province: 'Harare',
          coordinates: {
            latitude: -17.8252,
            longitude: 31.0335,
            timestamp: new Date(),
          },
        },
        deliveryLocation: {
          street: '456 Delivery Street',
          city: 'Harare',
          province: 'Harare',
          coordinates: {
            latitude: -17.8300,
            longitude: 31.0400,
            timestamp: new Date(),
          },
        },
      };

      const delivery = deliveryService.createDelivery(deliveryData);
      const updatedDelivery = deliveryService.updateDeliveryStatus(
        delivery.id,
        DeliveryStatus.PICKED_UP,
        'Package picked up'
      );

      expect(updatedDelivery).toBeDefined();
      expect(updatedDelivery?.status).toBe(DeliveryStatus.PICKED_UP);
      expect(updatedDelivery?.notes).toBe('Package picked up');
    });

    it('should mark driver as available when delivery is completed', () => {
      const driverData = {
        name: 'John Driver',
        phone: '+263771234567',
        email: 'driver@example.com',
        vehicleType: 'car',
        vehicleNumber: 'ABC1234',
      };

      const driver = driverService.createDriver(driverData);
      driverService.updateDriverStatus(driver.id, DriverStatus.AVAILABLE, true);

      const deliveryData = {
        orderId: '550e8400-e29b-41d4-a716-446655440000',
        customerName: 'John Customer',
        customerPhone: '+263771234567',
        pickupLocation: {
          street: '123 Main Street',
          city: 'Harare',
          province: 'Harare',
          coordinates: {
            latitude: -17.8252,
            longitude: 31.0335,
            timestamp: new Date(),
          },
        },
        deliveryLocation: {
          street: '456 Delivery Street',
          city: 'Harare',
          province: 'Harare',
          coordinates: {
            latitude: -17.8300,
            longitude: 31.0400,
            timestamp: new Date(),
          },
        },
      };

      const delivery = deliveryService.createDelivery(deliveryData);
      deliveryService.assignDriver(delivery.id, driver.id);

      // Complete delivery
      deliveryService.updateDeliveryStatus(delivery.id, DeliveryStatus.DELIVERED);

      const updatedDriver = driverService.getDriverById(driver.id);
      expect(updatedDriver?.status).toBe(DriverStatus.AVAILABLE);
      expect(updatedDriver?.isAvailable).toBe(true);
      expect(updatedDriver?.completedDeliveries).toBe(1);
    });
  });

  describe('getDeliveriesByStatus', () => {
    it('should return deliveries filtered by status', () => {
      const deliveryData1 = {
        orderId: '550e8400-e29b-41d4-a716-446655440001',
        customerName: 'John Customer 1',
        customerPhone: '+263771234567',
        pickupLocation: {
          street: '123 Main Street',
          city: 'Harare',
          province: 'Harare',
          coordinates: {
            latitude: -17.8252,
            longitude: 31.0335,
            timestamp: new Date(),
          },
        },
        deliveryLocation: {
          street: '456 Delivery Street',
          city: 'Harare',
          province: 'Harare',
          coordinates: {
            latitude: -17.8300,
            longitude: 31.0400,
            timestamp: new Date(),
          },
        },
      };

      const deliveryData2 = {
        orderId: '550e8400-e29b-41d4-a716-446655440002',
        customerName: 'John Customer 2',
        customerPhone: '+263771234567',
        pickupLocation: {
          street: '789 Main Street',
          city: 'Harare',
          province: 'Harare',
          coordinates: {
            latitude: -17.8252,
            longitude: 31.0335,
            timestamp: new Date(),
          },
        },
        deliveryLocation: {
          street: '101 Delivery Street',
          city: 'Harare',
          province: 'Harare',
          coordinates: {
            latitude: -17.8300,
            longitude: 31.0400,
            timestamp: new Date(),
          },
        },
      };

      const delivery1 = deliveryService.createDelivery(deliveryData1);
      const delivery2 = deliveryService.createDelivery(deliveryData2);

      deliveryService.updateDeliveryStatus(delivery2.id, DeliveryStatus.DELIVERED);

      const pendingDeliveries = deliveryService.getDeliveriesByStatus(DeliveryStatus.PENDING);
      expect(pendingDeliveries).toHaveLength(1);
      expect(pendingDeliveries[0].id).toBe(delivery1.id);

      const deliveredDeliveries = deliveryService.getDeliveriesByStatus(DeliveryStatus.DELIVERED);
      expect(deliveredDeliveries).toHaveLength(1);
      expect(deliveredDeliveries[0].id).toBe(delivery2.id);
    });
  });
});
