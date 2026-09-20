const { evaluateInvoiceStatus } = require('../utils/overdue');

describe('Overdue Invoice Status Evaluation', () => {
  test('should return Paid if invoice status is Paid regardless of due date', () => {
    const pastDueDate = new Date();
    pastDueDate.setDate(pastDueDate.getDate() - 10);

    const invoice = { status: 'Paid', dueDate: pastDueDate };
    expect(evaluateInvoiceStatus(invoice)).toBe('Paid');
  });

  test('should return Draft if invoice status is Draft regardless of due date', () => {
    const pastDueDate = new Date();
    pastDueDate.setDate(pastDueDate.getDate() - 10);

    const invoice = { status: 'Draft', dueDate: pastDueDate };
    expect(evaluateInvoiceStatus(invoice)).toBe('Draft');
  });

  test('should return Overdue if status is Unpaid and due date is in the past', () => {
    const pastDueDate = new Date();
    pastDueDate.setDate(pastDueDate.getDate() - 5);

    const invoice = { status: 'Unpaid', dueDate: pastDueDate };
    expect(evaluateInvoiceStatus(invoice)).toBe('Overdue');
  });

  test('should return Unpaid if status is Unpaid and due date is in the future', () => {
    const futureDueDate = new Date();
    futureDueDate.setDate(futureDueDate.getDate() + 10);

    const invoice = { status: 'Unpaid', dueDate: futureDueDate };
    expect(evaluateInvoiceStatus(invoice)).toBe('Unpaid');
  });
});
