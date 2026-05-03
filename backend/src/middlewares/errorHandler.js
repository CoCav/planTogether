const multer = require("multer");

/* ==================================================
   GLOBAL ERROR HANDLER
   Centralizes all application errors into a consistent API response

   Handles:
   - Multer upload errors (file size, invalid files)
   - Sequelize validation and constraint errors
   - Custom application errors (with statusCode)
   - Fallback for unexpected server errors

   Behavior:
   - Returns structured JSON responses
   - Hides stack trace in production
   - Logs detailed errors in development
================================================== */

function errorHandler(error, req, res, next) {
    const isProd = process.env.NODE_ENV === "production";

    /* =========================
       Logging
    ========================= */
    if (!isProd) {
        console.error("Error caught by error middleware:", error);
    } else {
        console.error("Error:", error.message);
    }

    /* =========================
       Multer errors (file upload)
    ========================= */
    if (error instanceof multer.MulterError) {
        let message = error.message;

        if (error.code === "LIMIT_FILE_SIZE") {
            message = "File too large. Maximum size exceeded.";
        }

        return res.status(400).json({
            success: false,
            message
        });
    }

    /* =========================
       Sequelize validation errors
    ========================= */
    if (
        error.name === "SequelizeValidationError" ||
        error.name === "SequelizeUniqueConstraintError"
    ) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: error.errors?.map((err) => ({
                field: err.path,
                message: err.message,
            })),
        });
    }

    /* =========================
       Default / custom errors
    ========================= */
    const statusCode = error.statusCode || 500;
    const message =
        error.message || "Internal Server Error. Please try again later.";

    return res.status(statusCode).json({
        success: false,
        message,
        ...(error.errors && { errors: error.errors }),
        ...(!isProd && { stack: error.stack }),
    });
}

module.exports = errorHandler;
