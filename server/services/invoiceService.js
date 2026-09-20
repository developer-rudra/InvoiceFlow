const Invoice = require('../models/Invoice');
const Client = require('../models/Client');
const { calculateInvoiceTotals } = require('../utils/calculations');
const { formatInvoiceWithStatus, evaluateInvoiceStatus } = require('../utils/overdue');
const generateInvoiceNumber = require('../utils/generateInvoiceNumber');

/**
 * Get all invoices with multi-filtering and populated client details
 */
const getInvoices = async (userId, queryParams = {}) => {
  const { status, clientId, search, from, to } = queryParams;

  const filter = { user: userId };

  if (clientId) {
    filter.client = clientId;
  }

  if (status) {
    if (status === 'Overdue') {
      // Overdue applies to Unpaid invoices where dueDate < today
      filter.status = 'Unpaid';
      filter.dueDate = { $lt: new Date() };
    } else {
      filter.status = status;
    }
  }

  if (from || to) {
    filter.issueDate = {};
    if (from) filter.issueDate.$gte = new Date(from);
    if (to) filter.issueDate.$lte = new Date(to);
  }

  let invoices = await Invoice.find(filter)
    .populate('client', 'name companyName email phone billingAddress gstNumber')
    .sort({ createdAt: -1 });

  // Filter by search query (invoice number or client name/company name)
  if (search) {
    const searchRegex = new RegExp(search.trim(), 'i');
    invoices = invoices.filter((inv) => {
      const invNumMatch = inv.invoiceNumber && searchRegex.test(inv.invoiceNumber);
      const clientNameMatch = inv.client && searchRegex.test(inv.client.name);
      const clientCompanyMatch = inv.client && searchRegex.test(inv.client.companyName);
      return invNumMatch || clientNameMatch || clientCompanyMatch;
    });
  }

  // Format dynamic status (check for overdue)
  return invoices.map((inv) => formatInvoiceWithStatus(inv));
};

/**
 * Get single invoice by ID
 */
const getInvoiceById = async (userId, invoiceId) => {
  const invoice = await Invoice.findOne({ _id: invoiceId, user: userId })
    .populate('client', 'name companyName email phone billingAddress gstNumber')
    .populate('user', 'name email companyName companyAddress companyPhone');

  if (!invoice) {
    const error = new Error('Invoice not found');
    error.statusCode = 404;
    throw error;
  }

  return formatInvoiceWithStatus(invoice);
};

/**
 * Create invoice with backend recalculation and auto invoice number
 */
const createInvoice = async (userId, invoiceData) => {
  const { clientId, items, taxPercentage, discount, issueDate, dueDate, status, notes } = invoiceData;

  // Verify client exists and belongs to user
  const clientExists = await Client.findOne({ _id: clientId, user: userId });
  if (!clientExists) {
    const error = new Error('Invalid client specified for invoice');
    error.statusCode = 400;
    throw error;
  }

  // Auto-generate invoice number
  const invoiceNumber = await generateInvoiceNumber(userId);

  // Recalculate totals on the backend (Source of Truth)
  const totals = calculateInvoiceTotals(items, taxPercentage, discount);

  const newInvoice = await Invoice.create({
    user: userId,
    client: clientId,
    invoiceNumber,
    items: totals.items,
    subtotal: totals.subtotal,
    taxPercentage: totals.taxPercentage,
    taxAmount: totals.taxAmount,
    discount: totals.discount,
    grandTotal: totals.grandTotal,
    issueDate: issueDate ? new Date(issueDate) : new Date(),
    dueDate: new Date(dueDate),
    status: status || 'Unpaid',
    notes: notes || ''
  });

  const populatedInvoice = await Invoice.findById(newInvoice._id)
    .populate('client', 'name companyName email phone billingAddress gstNumber');

  return formatInvoiceWithStatus(populatedInvoice);
};

/**
 * Update existing invoice with recalculation
 */
const updateInvoice = async (userId, invoiceId, invoiceData) => {
  const invoice = await Invoice.findOne({ _id: invoiceId, user: userId });

  if (!invoice) {
    const error = new Error('Invoice not found');
    error.statusCode = 404;
    throw error;
  }

  const { clientId, items, taxPercentage, discount, issueDate, dueDate, status, notes } = invoiceData;

  if (clientId) {
    const clientExists = await Client.findOne({ _id: clientId, user: userId });
    if (!clientExists) {
      const error = new Error('Invalid client specified');
      error.statusCode = 400;
      throw error;
    }
    invoice.client = clientId;
  }

  if (items) {
    const taxP = taxPercentage !== undefined ? taxPercentage : invoice.taxPercentage;
    const disc = discount !== undefined ? discount : invoice.discount;
    const totals = calculateInvoiceTotals(items, taxP, disc);

    invoice.items = totals.items;
    invoice.subtotal = totals.subtotal;
    invoice.taxPercentage = totals.taxPercentage;
    invoice.taxAmount = totals.taxAmount;
    invoice.discount = totals.discount;
    invoice.grandTotal = totals.grandTotal;
  } else if (taxPercentage !== undefined || discount !== undefined) {
    const taxP = taxPercentage !== undefined ? taxPercentage : invoice.taxPercentage;
    const disc = discount !== undefined ? discount : invoice.discount;
    const totals = calculateInvoiceTotals(invoice.items, taxP, disc);

    invoice.subtotal = totals.subtotal;
    invoice.taxPercentage = totals.taxPercentage;
    invoice.taxAmount = totals.taxAmount;
    invoice.discount = totals.discount;
    invoice.grandTotal = totals.grandTotal;
  }

  if (issueDate) invoice.issueDate = new Date(issueDate);
  if (dueDate) invoice.dueDate = new Date(dueDate);
  if (status) invoice.status = status;
  if (notes !== undefined) invoice.notes = notes;

  await invoice.save();

  const updatedInvoice = await Invoice.findById(invoice._id)
    .populate('client', 'name companyName email phone billingAddress gstNumber');

  return formatInvoiceWithStatus(updatedInvoice);
};

/**
 * Delete invoice
 */
const deleteInvoice = async (userId, invoiceId) => {
  const invoice = await Invoice.findOne({ _id: invoiceId, user: userId });

  if (!invoice) {
    const error = new Error('Invoice not found');
    error.statusCode = 404;
    throw error;
  }

  await Invoice.deleteOne({ _id: invoiceId });
  return { message: 'Invoice deleted successfully' };
};

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice
};
