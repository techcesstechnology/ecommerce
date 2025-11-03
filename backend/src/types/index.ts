export interface Location {
  latitude: number;
  longitude: number;
  timestamp: Date;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleType: string;
  vehicleNumber: string;
  status: DriverStatus;
  currentLocation?: Location;
  isAvailable: boolean;
  rating?: number;
  completedDeliveries: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum DriverStatus {
  AVAILABLE = 'available',
  ON_DELIVERY = 'on_delivery',
  OFFLINE = 'offline',
  BREAK = 'break'
}

export interface Delivery {
  id: string;
  orderId: string;
  driverId?: string;
  customerName: string;
  customerPhone: string;
  pickupLocation: Address;
  deliveryLocation: Address;
  status: DeliveryStatus;
  estimatedArrival?: Date;
  actualArrival?: Date;
  assignedAt?: Date;
  completedAt?: Date;
  trackingUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum DeliveryStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface Address {
  street: string;
  city: string;
  province: string;
  postalCode?: string;
  coordinates: Location;
}

export interface Route {
  id: string;
  driverId: string;
  deliveries: string[];
  waypoints: Location[];
  totalDistance: number;
  estimatedDuration: number;
  optimized: boolean;
  createdAt: Date;
}

export interface TrackingUpdate {
  deliveryId: string;
  driverId: string;
  location: Location;
  status: DeliveryStatus;
  estimatedArrival?: Date;
  timestamp: Date;
}

export interface NotificationPayload {
  recipient: string;
  message: string;
  type: 'sms' | 'push';
  deliveryId?: string;
}
