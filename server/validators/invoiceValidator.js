const { body } = require('express-validator');

const invoiceValidationRules = [
  body('clientId')
    .notEmpty()
    .withMessage('Client is required')
    .isMongoId()
    .withMessage('Invalid client ID format'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required in the invoice'),
  body('items.*.description')
    .trim()
    .notEmpty()
    .withMessage('Item description is required'),
  body('items.*.quantity')
    .isNumeric()
    .withMessage('Item quantity must be a number')
    .custom((val) => Number(val) > 0)
    .withMessage('Item quantity must be greater than 0'),
  body('items.*.rate')
    .isNumeric()
    .withMessage('Item rate must be a number')
    .custom((val) => Number(val) >= 0)
    .withMessage('Item rate cannot be negative'),
  body('taxPercentage')
    .optional()
    .isNumeric()
    .withMessage('Tax percentage must be a number')
    .custom((val) => Number(val) >= 0 && Number(val) <= 100)
    .withMessage('Tax percentage must be between 0 and 100'),
  body('discount')
    .optional()
    .isNumeric()
    .withMessage('Discount must be a number')
    .custom((val) => Number(val) >= 0)
    .withMessage('Discount cannot be negative'),
  body('issueDate')
    .notEmpty()
    .withMessage('Issue date is required')
    .isISO8601()
    .withMessage('Please provide a valid issue date'),
  body('dueDate')
    .notEmpty()
    .withMessage('Due date is required')
    .isISO8601()
    .withMessage('Please provide a valid due date'),
  body('status')
    .optional()
    .isIn(['Draft', 'Unpaid', 'Paid', 'Overdue'])
    .withMessage('Invalid invoice status')
];

module.exports = {
  invoiceValidationRules
};
