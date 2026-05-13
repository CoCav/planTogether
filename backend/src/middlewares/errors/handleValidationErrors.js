const { validationResult } = require("express-validator");

const logger = require("../../config/logger");

const { createHttpError } = require("../../utils/errors/httpError");

/* ==================================================
   HANDLE VALIDATION ERRORS MIDDLEWARE

   Handles:
   - express-validator result checking
   - validation error formatting
   - forwarding validation errors to errorHandler
   - centralized validation warning logging

   Notes:
   - validators run before this middleware
   - this middleware does not validate by itself
   - formatted errors are forwarded with status 400
================================================== */

// Handle validation errors after express-validator rules
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const rawErrors = errors.array();

        if (process.env.NODE_ENV !== "production") {
            logger.warn({ errors: rawErrors }, "Validation errors");
        }

        const formattedErrors = rawErrors.map((err) => ({
            field: err.path || err.param,
            message: err.msg
        }));

        const error = createHttpError(400, "Validation failed");

        error.errors = formattedErrors;

        return next(error);
    }

    return next();
};

module.exports = handleValidationErrors;
