const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { invoiceValidationRules } = require('../validators/invoiceValidator');
const validate = require('../middleware/validateMiddleware');
const { protect } = require('../middleware/authMiddleware');

// All invoice routes require authentication
router.use(protect);

router.route('/')
  .get(invoiceController.getInvoices)
  .post(invoiceValidationRules, validate, invoiceController.createInvoice);

router.route('/:id')
  .get(invoiceController.getInvoiceById)
  .put(invoiceController.updateInvoice)
  .delete(invoiceController.deleteInvoice);

module.exports = router;
