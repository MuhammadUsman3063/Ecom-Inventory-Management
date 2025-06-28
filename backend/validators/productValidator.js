// ✅ validators/productValidator.js

const { check } = require('express-validator');

// Product validation rules compatible with multipart/form-data
const productValidationRules = [
  check('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),

  check('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ gt: 0 }).withMessage('Price must be a number greater than 0'),

  check('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),

  check('category')
    .trim()
    .notEmpty().withMessage('Category is required')
];

module.exports = productValidationRules;
