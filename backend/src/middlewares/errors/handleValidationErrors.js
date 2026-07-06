const { validationResult } = require("express-validator");

const logger = require("../../config/logger");
const { createHttpError } = require("../../utils/errors/httpError");

/* ==========================================================================
   Handle Validation Errors Middleware

   Formats express-validator errors and forwards them to the error handler.

   Responsibilities
   - Read express-validator results
   - Format validation errors
   - Attach formatted errors to an HTTP 400 error
   - Forward validation errors to the global error handler

   Notes
   - Validators run before this middleware.
   - This middleware does not validate by itself.
=========================================================================== */

const PRODUCTION_ENV = "production";
const VALIDATION_FAILED_MESSAGE = "Validation failed";

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const rawErrors = errors.array();

        if (process.env.NODE_ENV !== PRODUCTION_ENV) {
            logger.warn({ errors: rawErrors }, "Validation errors");
        }

        const formattedErrors = rawErrors.map((err) => ({
            field: err.path || err.param,
            message: err.msg
        }));

        const error = createHttpError(400, VALIDATION_FAILED_MESSAGE);
        error.errors = formattedErrors;

        return next(error);
    }

    return next();
};

module.exports = handleValidationErrors;
