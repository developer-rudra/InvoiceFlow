const { calculateInvoiceTotals, roundCurrency } = require('../utils/calculations');

describe('Invoice Calculations Business Rules', () => {
  test('should accurately calculate subtotal, taxAmount, and grandTotal', () => {
    const items = [
      { description: 'Service 1', quantity: 2, rate: 500 }, // 1000
      { description: 'Service 2', quantity: 1, rate: 250 }  // 250
    ];
    const taxPercentage = 18; // 18% of 1250 = 225
    const discount = 50;

    const result = calculateInvoiceTotals(items, taxPercentage, discount);

    expect(result.subtotal).toBe(1250);
    expect(result.taxAmount).toBe(225);
    expect(result.discount).toBe(50);
    expect(result.grandTotal).toBe(1425); // 1250 + 225 - 50 = 1425
  });

  test('should handle floating point rounding correctly', () => {
    const items = [{ description: 'Item', quantity: 3, rate: 33.33 }]; // 99.99
    const taxPercentage = 5; // 4.9995 -> 5.00
    const result = calculateInvoiceTotals(items, taxPercentage, 0);

    expect(result.subtotal).toBe(99.99);
    expect(result.taxAmount).toBe(5);
    expect(result.grandTotal).toBe(104.99);
  });

  test('should ignore negative quantities and rates by converting them to non-negative numbers', () => {
    const items = [{ description: 'Item', quantity: -5, rate: -100 }];
    const result = calculateInvoiceTotals(items, 10, -50);

    expect(result.subtotal).toBe(0);
    expect(result.grandTotal).toBe(0);
  });

  test('should prevent discount from causing a negative grand total', () => {
    const items = [{ description: 'Item', quantity: 1, rate: 100 }];
    const taxPercentage = 0;
    const discount = 500; // Greater than subtotal

    const result = calculateInvoiceTotals(items, taxPercentage, discount);

    expect(result.subtotal).toBe(100);
    expect(result.grandTotal).toBe(0); // Clamped at 0
  });
});
