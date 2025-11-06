export const formatCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

export const formatCurrencyZWL = (amount: number): string => {
  return `ZWL $${amount.toFixed(2)}`;
};
