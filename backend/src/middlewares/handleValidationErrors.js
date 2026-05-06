const { validationResult } = require('express-validator');

/* ==================================================
   HANDLE VALIDATION ERRORS MIDDLEWARE

   Handles:
   - express-validator result checking
   - validation error formatting
   - forwarding validation errors to errorHandler

   Notes:
   - validators run before this middleware
   - this middleware does not validate by itself
   - formatted errors are returned with status 400
================================================== */

// Handle validation errors after express-validator rules
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        if (process.env.NODE_ENV !== 'production') {
            console.log('Validation errors:', errors.array());
        }

        // Normalize express-validator errors for API responses
        const formattedErrors = errors.array().map((err) => ({
            field: err.path || err.param,
            message: err.msg
        }));

        return next({
            statusCode: 400,
            message: 'Validation failed',
            errors: formattedErrors
        });
    }

    return next();
};

module.exports = handleValidationErrors;
