import { Currency } from '../types';
import { config } from '../config';
import { randomInt } from 'crypto';

export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  if (fromCurrency === Currency.USD && toCurrency === Currency.ZWL) {
    return amount * config.currency.usdToZwlRate;
  }

  if (fromCurrency === Currency.ZWL && toCurrency === Currency.USD) {
    return amount / config.currency.usdToZwlRate;
  }

  return amount;
}

export function generateOrderId(): string {
  const timestamp = Date.now();
  const random = randomInt(10000);
  return `ORD-${timestamp}-${random}`;
}

export function generatePaymentId(): string {
  const timestamp = Date.now();
  const random = randomInt(10000);
  return `PAY-${timestamp}-${random}`;
}

export function generateTrackingNumber(): string {
  const timestamp = Date.now();
  const random = randomInt(1000000);
  return `TRK${timestamp}${random}`;
}

export function calculateTax(subtotal: number, taxRate = 0.15): number {
  return Number((subtotal * taxRate).toFixed(2));
}

export function calculateShippingCost(subtotal: number, currency: Currency): number {
  const baseShipping = currency === Currency.USD ? 5 : 5000;
  
  if (subtotal >= (currency === Currency.USD ? 50 : 50000)) {
    return 0;
  }
  
  return baseShipping;
}
