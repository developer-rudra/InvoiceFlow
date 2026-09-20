/**
 * Evaluates whether an invoice status should dynamically be 'Overdue'.
 *
 * Rule: If current date > dueDate AND status is NOT 'Paid',
 * then status is considered 'Overdue'.
 *
 * @param {Object} invoice Mongoose document or plain invoice object
 * @returns {String} Dynamic status ('Paid', 'Overdue', 'Unpaid', or 'Draft')
 */
const evaluateInvoiceStatus = (invoice) => {
  if (!invoice) return 'Unpaid';

  const rawStatus = invoice.status || 'Unpaid';

  // Paid status is final and never becomes overdue
  if (rawStatus === 'Paid') {
    return 'Paid';
  }

  // Draft status remains Draft unless explicitly changed
  if (rawStatus === 'Draft') {
    return 'Draft';
  }

  if (invoice.dueDate) {
    const due = new Date(invoice.dueDate);
    const today = new Date();
    // Compare dates ignoring time if needed, or exact timestamp
    // Standard: set today to end of day or compare timestamps
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    if (today > due) {
      return 'Overdue';
    }
  }

  return rawStatus;
};

/**
 * Mutates or attaches evaluated status to invoice object before returning to client.
 */
const formatInvoiceWithStatus = (invoiceDoc) => {
  if (!invoiceDoc) return null;
  const obj = invoiceDoc.toObject ? invoiceDoc.toObject() : { ...invoiceDoc };
  obj.status = evaluateInvoiceStatus(obj);
  return obj;
};

module.exports = {
  evaluateInvoiceStatus,
  formatInvoiceWithStatus
};
