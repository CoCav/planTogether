const multer = require("multer");

/* ==================================================
   ERROR HANDLER MIDDLEWARE

   Handles:
   - Multer upload errors
   - Sequelize validation and constraint errors
   - custom application errors
   - unexpected server errors

   Notes:
   - returns consistent JSON responses
   - hides stack trace in production
   - logs detailed errors outside production
================================================== */

// Centralize API error responses
function errorHandler(error, req, res, next) {
    const isProd = process.env.NODE_ENV === "production";

    /* =============================
       LOGGING
    ============================= */

    if (!isProd) {
        console.error("Error caught by error middleware:", error);
    } else {
        console.error("Error:", error.message);
    }

    /* =============================
       MULTER ERRORS
    ============================= */

    if (error instanceof multer.MulterError) {
        let message = error.message;

        // Provide clearer message for upload size errors
        if (error.code === "LIMIT_FILE_SIZE") {
            message = "File too large. Maximum size exceeded.";
        }

        return res.status(400).json({
            success: false,
            message
        });
    }

    /* =============================
       SEQUELIZE ERRORS
    ============================= */

    if (
        error.name === "SequelizeValidationError" ||
        error.name === "SequelizeUniqueConstraintError"
    ) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: error.errors?.map((err) => ({
                field: err.path,
                message: err.message
            }))
        });
    }

    /* =============================
       DEFAULT / CUSTOM ERRORS
    ============================= */

    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error. Please try again later.";

    return res.status(statusCode).json({
        success: false,
        message,
        ...(error.errors && { errors: error.errors }),
        ...(!isProd && { stack: error.stack })
    });
}

module.exports = errorHandler;
