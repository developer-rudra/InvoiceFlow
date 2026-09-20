const { body } = require('express-validator');

const clientValidationRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Client name is required'),
  body('companyName')
    .trim()
    .notEmpty()
    .withMessage('Company name is required'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),
  body('billingAddress')
    .trim()
    .notEmpty()
    .withMessage('Billing address is required'),
  body('gstNumber')
    .optional()
    .trim()
];

module.exports = {
  clientValidationRules
};
