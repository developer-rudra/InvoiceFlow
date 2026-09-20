/**
 * Format monetary amount in Indian Rupees / Currency format.
 * Example: 20000 -> ₹20,000.00
 */
export const formatCurrency = (amount = 0, currency = 'INR') => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  }).format(num);
};

/**
 * Format ISO date string into readable date.
 * Example: 2026-09-20T00:00:00.000Z -> Sep 20, 2026
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

/**
 * Formats ISO date into YYYY-MM-DD for HTML input fields
 */
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};
