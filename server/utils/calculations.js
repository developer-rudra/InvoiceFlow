/**
 * Round monetary values to 2 decimal places safely.
 */
const roundCurrency = (num) => {
  return Math.round((Number(num) + Number.EPSILON) * 100) / 100;
};

/**
 * Recalculates invoice items, subtotal, taxAmount, and grandTotal.
 * Backend calculation MUST be the single source of truth.
 *
 * @param {Array} rawItems Array of items { description, quantity, rate }
 * @param {Number} taxPercentage Percentage of tax (0 - 100)
 * @param {Number} discount Dollar/Rupee discount amount
 * @returns {Object} { items, subtotal, taxPercentage, taxAmount, discount, grandTotal }
 */
const calculateInvoiceTotals = (rawItems = [], taxPercentage = 0, discount = 0) => {
  const parsedTaxPercent = Math.max(0, Math.min(100, Number(taxPercentage) || 0));
  const parsedDiscount = Math.max(0, Number(discount) || 0);

  let calculatedSubtotal = 0;

  const processedItems = rawItems.map((item) => {
    const qty = Math.max(0, Number(item.quantity) || 0);
    const rate = Math.max(0, Number(item.rate) || 0);
    const lineAmount = roundCurrency(qty * rate);

    calculatedSubtotal += lineAmount;

    return {
      description: item.description ? String(item.description).trim() : '',
      quantity: qty,
      rate: roundCurrency(rate),
      amount: lineAmount
    };
  });

  const subtotal = roundCurrency(calculatedSubtotal);
  const taxAmount = roundCurrency((subtotal * parsedTaxPercent) / 100);
  
  // Grand total cannot be negative
  const rawGrandTotal = subtotal + taxAmount - parsedDiscount;
  const grandTotal = roundCurrency(Math.max(0, rawGrandTotal));

  return {
    items: processedItems,
    subtotal,
    taxPercentage: roundCurrency(parsedTaxPercent),
    taxAmount,
    discount: roundCurrency(parsedDiscount),
    grandTotal
  };
};

module.exports = {
  roundCurrency,
  calculateInvoiceTotals
};
