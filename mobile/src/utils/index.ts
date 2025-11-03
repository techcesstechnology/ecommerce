/**
 * Format currency for display in Zimbabwe
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-ZW', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Format date for display
 */
export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-ZW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};
