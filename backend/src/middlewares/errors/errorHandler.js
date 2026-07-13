const multer = require("multer");

const logger = require("../../config/logger");

/* ==========================================================================
   Error Handler Middleware

   Centralizes API error responses.

   Responsibilities
   - Handle Multer upload errors
   - Handle Sequelize validation and constraint errors
   - Handle custom application errors
   - Handle unexpected server errors

   Notes
   - Returns consistent JSON responses.
   - Hides stack traces in production.
   - Uses centralized structured logging.
=========================================================================== */

const PRODUCTION_ENV = "production";

const MULTER_FILE_SIZE_ERROR_CODE = "LIMIT_FILE_SIZE";

const SEQUELIZE_VALIDATION_ERROR = "SequelizeValidationError";
const SEQUELIZE_UNIQUE_CONSTRAINT_ERROR = "SequelizeUniqueConstraintError";

const VALIDATION_ERROR_MESSAGE = "Validation error";
const FILE_TOO_LARGE_MESSAGE = "File too large. Maximum size exceeded.";
const INTERNAL_SERVER_ERROR_MESSAGE = "Internal Server Error. Please try again later.";

function errorHandler(error, req, res, next) {
    const isProduction = process.env.NODE_ENV === PRODUCTION_ENV;

    if (!isProduction) {
        logger.error(
            { error },
            "Error caught by error middleware"
        );
    } else {
        logger.error(
            { message: error.message },
            "Error"
        );
    }

    if (error instanceof multer.MulterError) {
        const message = error.code === MULTER_FILE_SIZE_ERROR_CODE
            ? FILE_TOO_LARGE_MESSAGE
            : error.message;

        return res.status(400).json({
            success: false,
            message
        });
    }

    if (error.name === SEQUELIZE_VALIDATION_ERROR || error.name === SEQUELIZE_UNIQUE_CONSTRAINT_ERROR) {

        const formattedErrors = error.errors?.map((err) => ({
            field: err.path,
            message: err.message
        }));

        return res.status(400).json({
            success: false,
            message: VALIDATION_ERROR_MESSAGE,
            ...(formattedErrors && {
                errors: formattedErrors
            })
        });
    }

    const statusCode = error.statusCode || 500;
    const message = error.message || INTERNAL_SERVER_ERROR_MESSAGE;

    return res.status(statusCode).json({
        success: false,
        message,
        ...(error.errors && { errors: error.errors }),
        ...(!isProduction && { stack: error.stack })
    });
}

module.exports = errorHandler;
