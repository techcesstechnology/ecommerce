import { sql } from 'drizzle-orm';

/**
 * Helper to get current timestamp for updatedAt fields
 * PostgreSQL doesn't support automatic ON UPDATE CURRENT_TIMESTAMP,
 * so we need to manually update these fields
 * 
 * Usage:
 * await db.update(products)
 *   .set({ name: 'New Name', ...withUpdatedAt() })
 *   .where(eq(products.id, productId));
 */
export function withUpdatedAt() {
  return {
    updatedAt: sql`NOW()`,
  };
}

/**
 * Generate a unique order number
 * Format: ORD-YYYYMMDD-XXX
 */
export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');

  return `ORD-${year}${month}${day}-${random}`;
}

/**
 * Calculate 15% tax (Zimbabwe standard rate)
 */
export function calculateTax(amount: number): number {
  return Math.round(amount * 0.15 * 100) / 100;
}

/**
 * Calculate order totals
 */
export function calculateOrderTotals(subtotal: number, shippingCost: number = 0, discount: number = 0) {
  const tax = calculateTax(subtotal);
  const total = subtotal + tax + shippingCost - discount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    shippingCost: Math.round(shippingCost * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}
