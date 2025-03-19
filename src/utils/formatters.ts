
/**
 * Format a number as currency with $ sign
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Format a number as percentage
 */
export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100);
};

/**
 * Format a number with commas
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

/**
 * Format change value with + or - sign and color class
 */
export const formatChange = (value: number): { text: string; className: string } => {
  const formatted = value > 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`;
  const className = value > 0 ? 'text-fin-success' : 'text-fin-error';
  return { text: formatted, className };
};
