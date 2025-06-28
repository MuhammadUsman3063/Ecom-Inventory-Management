// ✅ middlewares/validateRequest.js

const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation Failed",
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }

  next();
};

module.exports = validateRequest;
