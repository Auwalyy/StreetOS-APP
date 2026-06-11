export const formatNaira = (amount: number, compact = false): string =>
  formatCurrency(amount, compact);

export const formatCurrency = (amount: number, compact = false): string => {
  if (compact) {
    if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const parseCurrencyInput = (input: string): number => {
  const cleaned = input.replace(/[₦,\s]/g, '');
  return parseFloat(cleaned) || 0;
};
