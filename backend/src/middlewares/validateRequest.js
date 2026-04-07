const { validationResult } = require('express-validator');

// Validates request data and forwards validation errors to the error handler
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Validation errors:', errors.array());
    }

    const formattedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    return next({
      statusCode: 400,
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }

  next();
};

module.exports = validateRequest;