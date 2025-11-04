// Shared utility functions
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-ZW', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}
