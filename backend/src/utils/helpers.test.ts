import {
  generateOrderId,
  generatePaymentId,
  generateTrackingNumber,
  calculateTax,
  calculateShippingCost,
  convertCurrency,
} from './helpers';
import { Currency } from '../types';

describe('Helpers', () => {
  describe('generateOrderId', () => {
    it('should generate order ID with correct format', () => {
      const orderId = generateOrderId();
      expect(orderId).toMatch(/^ORD-\d+-\d+$/);
    });

    it('should generate unique order IDs', () => {
      const id1 = generateOrderId();
      const id2 = generateOrderId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('generatePaymentId', () => {
    it('should generate payment ID with correct format', () => {
      const paymentId = generatePaymentId();
      expect(paymentId).toMatch(/^PAY-\d+-\d+$/);
    });
  });

  describe('generateTrackingNumber', () => {
    it('should generate tracking number with correct format', () => {
      const trackingNumber = generateTrackingNumber();
      expect(trackingNumber).toMatch(/^TRK\d+$/);
    });
  });

  describe('calculateTax', () => {
    it('should calculate tax with default rate', () => {
      const tax = calculateTax(100);
      expect(tax).toBe(15.0);
    });

    it('should calculate tax with custom rate', () => {
      const tax = calculateTax(100, 0.2);
      expect(tax).toBe(20.0);
    });

    it('should round to 2 decimal places', () => {
      const tax = calculateTax(33.33, 0.15);
      expect(tax).toBe(5.0);
    });
  });

  describe('calculateShippingCost', () => {
    it('should return base shipping for USD under threshold', () => {
      const cost = calculateShippingCost(30, Currency.USD);
      expect(cost).toBe(5);
    });

    it('should return free shipping for USD over threshold', () => {
      const cost = calculateShippingCost(60, Currency.USD);
      expect(cost).toBe(0);
    });

    it('should return base shipping for ZWL under threshold', () => {
      const cost = calculateShippingCost(30000, Currency.ZWL);
      expect(cost).toBe(5000);
    });

    it('should return free shipping for ZWL over threshold', () => {
      const cost = calculateShippingCost(60000, Currency.ZWL);
      expect(cost).toBe(0);
    });
  });

  describe('convertCurrency', () => {
    it('should return same amount for same currency', () => {
      const result = convertCurrency(100, Currency.USD, Currency.USD);
      expect(result).toBe(100);
    });

    it('should convert USD to ZWL', () => {
      const result = convertCurrency(1, Currency.USD, Currency.ZWL);
      expect(result).toBe(1000);
    });

    it('should convert ZWL to USD', () => {
      const result = convertCurrency(1000, Currency.ZWL, Currency.USD);
      expect(result).toBe(1);
    });
  });
});
