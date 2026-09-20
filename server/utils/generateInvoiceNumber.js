const Invoice = require('../models/Invoice');

/**
 * Auto-generates a unique invoice number for a given user.
 * Format: INV-YYYY-001, INV-YYYY-002, etc.
 *
 * @param {String} userId Mongoose ObjectId of the user
 * @returns {Promise<String>} Next available invoice number
 */
const generateInvoiceNumber = async (userId) => {
  const currentYear = new Date().getFullYear();
  const prefix = `INV-${currentYear}-`;

  // Find latest invoice for this user in the current year matching pattern
  const latestInvoice = await Invoice.findOne({
    user: userId,
    invoiceNumber: new RegExp(`^INV-${currentYear}-\\d{3,}$`)
  }).sort({ createdAt: -1 });

  let nextSequence = 1;

  if (latestInvoice && latestInvoice.invoiceNumber) {
    const parts = latestInvoice.invoiceNumber.split('-');
    if (parts.length === 3) {
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) {
        nextSequence = lastSeq + 1;
      }
    }
  }

  // Format with leading zeros (at least 3 digits)
  const formattedSequence = String(nextSequence).padStart(3, '0');
  const candidateInvoiceNumber = `${prefix}${formattedSequence}`;

  // Extra safety check against duplicates
  const existing = await Invoice.findOne({ user: userId, invoiceNumber: candidateInvoiceNumber });
  if (existing) {
    // If somehow exists, find highest count overall for user
    const totalCount = await Invoice.countDocuments({ user: userId });
    return `${prefix}${String(totalCount + 1).padStart(3, '0')}`;
  }

  return candidateInvoiceNumber;
};

module.exports = generateInvoiceNumber;
