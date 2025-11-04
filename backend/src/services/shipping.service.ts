import { ShippingAddress } from '../models/order.model';

export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: number;
  carrier: string;
}

export interface ShippingRate {
  destination: string;
  baseRate: number;
  perKgRate: number;
}

export interface TrackingInfo {
  trackingNumber: string;
  carrier: string;
  status: string;
  location: string;
  timestamp: Date;
  events: {
    status: string;
    location: string;
    timestamp: Date;
    description: string;
  }[];
}

export class ShippingService {
  /**
   * Get available shipping options
   */
  async getShippingOptions(
    destination: ShippingAddress,
    weight: number = 1
  ): Promise<ShippingOption[]> {
    // Mock shipping options
    const baseOptions: ShippingOption[] = [
      {
        id: 'standard',
        name: 'Standard Shipping',
        description: 'Delivery within 5-7 business days',
        price: 5,
        estimatedDays: 7,
        carrier: 'ZimPost',
      },
      {
        id: 'express',
        name: 'Express Shipping',
        description: 'Delivery within 2-3 business days',
        price: 15,
        estimatedDays: 3,
        carrier: 'CourierConnect',
      },
      {
        id: 'overnight',
        name: 'Overnight Shipping',
        description: 'Next business day delivery',
        price: 25,
        estimatedDays: 1,
        carrier: 'FastTrack',
      },
    ];

    // Adjust prices based on destination
    const distanceMultiplier = this.getDistanceMultiplier(destination.city);
    const weightMultiplier = Math.max(1, weight / 5); // Per 5kg

    return baseOptions.map((option) => ({
      ...option,
      price: Math.round(option.price * distanceMultiplier * weightMultiplier * 100) / 100,
    }));
  }

  /**
   * Calculate shipping cost
   */
  async calculateShipping(
    destination: ShippingAddress,
    weight: number,
    shippingOptionId: string = 'standard'
  ): Promise<number> {
    const options = await this.getShippingOptions(destination, weight);
    const selectedOption = options.find((opt) => opt.id === shippingOptionId);

    if (!selectedOption) {
      throw new Error('Invalid shipping option');
    }

    return selectedOption.price;
  }

  /**
   * Generate tracking number
   */
  generateTrackingNumber(carrier: string = 'ZimPost'): string {
    const prefix = carrier.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Get tracking information
   */
  async getTrackingInfo(trackingNumber: string): Promise<TrackingInfo> {
    // Mock tracking info
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    return {
      trackingNumber,
      carrier: 'ZimPost',
      status: 'in_transit',
      location: 'Harare Distribution Center',
      timestamp: now,
      events: [
        {
          status: 'picked_up',
          location: 'Harare Warehouse',
          timestamp: twoDaysAgo,
          description: 'Package picked up from warehouse',
        },
        {
          status: 'in_transit',
          location: 'Harare Distribution Center',
          timestamp: yesterday,
          description: 'Package arrived at distribution center',
        },
        {
          status: 'out_for_delivery',
          location: 'Local Delivery Hub',
          timestamp: now,
          description: 'Package out for delivery',
        },
      ],
    };
  }

  /**
   * Validate shipping address
   */
  validateAddress(address: ShippingAddress): {
    valid: boolean;
    errors: string[];
    suggestions?: ShippingAddress;
  } {
    const errors: string[] = [];

    if (!address.fullName || address.fullName.trim().length < 2) {
      errors.push('Full name is required');
    }

    if (!address.phone || !/^\+?[0-9]{10,15}$/.test(address.phone.replace(/[\s-]/g, ''))) {
      errors.push('Valid phone number is required');
    }

    if (!address.addressLine1 || address.addressLine1.trim().length < 5) {
      errors.push('Address line 1 is required');
    }

    if (!address.city || address.city.trim().length < 2) {
      errors.push('City is required');
    }

    if (!address.province || address.province.trim().length < 2) {
      errors.push('Province is required');
    }

    if (!address.country || address.country.trim().length < 2) {
      errors.push('Country is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get distance multiplier based on city
   */
  private getDistanceMultiplier(city: string): number {
    const cityMultipliers: Record<string, number> = {
      harare: 1.0,
      bulawayo: 1.3,
      mutare: 1.2,
      gweru: 1.1,
      chitungwiza: 1.0,
      kwekwe: 1.2,
      kadoma: 1.2,
      masvingo: 1.3,
      chinhoyi: 1.1,
      norton: 1.1,
    };

    return cityMultipliers[city.toLowerCase()] || 1.5;
  }

  /**
   * Estimate delivery date
   */
  estimateDeliveryDate(shippingOptionId: string = 'standard'): Date {
    const daysMap: Record<string, number> = {
      standard: 7,
      express: 3,
      overnight: 1,
    };

    const days = daysMap[shippingOptionId] || 7;
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + days);

    return deliveryDate;
  }
}

export const shippingService = new ShippingService();
