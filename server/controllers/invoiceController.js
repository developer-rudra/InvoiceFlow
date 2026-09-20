const invoiceService = require('../services/invoiceService');

/**
 * @desc    Get all invoices with filters
 * @route   GET /api/invoices
 * @access  Private
 */
const getInvoices = async (req, res, next) => {
  try {
    const invoices = await invoiceService.getInvoices(req.user._id, req.query);
    return res.status(200).json({
      success: true,
      message: 'Invoices retrieved successfully',
      data: invoices
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single invoice by ID
 * @route   GET /api/invoices/:id
 * @access  Private
 */
const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await invoiceService.getInvoiceById(req.user._id, req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Invoice details retrieved successfully',
      data: invoice
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new invoice
 * @route   POST /api/invoices
 * @access  Private
 */
const createInvoice = async (req, res, next) => {
  try {
    const invoice = await invoiceService.createInvoice(req.user._id, req.body);
    return res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing invoice
 * @route   PUT /api/invoices/:id
 * @access  Private
 */
const updateInvoice = async (req, res, next) => {
  try {
    const invoice = await invoiceService.updateInvoice(req.user._id, req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an invoice
 * @route   DELETE /api/invoices/:id
 * @access  Private
 */
const deleteInvoice = async (req, res, next) => {
  try {
    const result = await invoiceService.deleteInvoice(req.user._id, req.params.id);
    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice
};
