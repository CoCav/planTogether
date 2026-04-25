// Centralized error handler (must be registered after routes)
function errorHandler(error, req, res, next) {
    const isProd = process.env.NODE_ENV === "production";

    if (!isProd) {
        console.error("Error caught by error middleware:", error);
    } else {
        console.error("Error:", error.message);
    }

    // Handle Sequelize validation errors
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

    const statusCode = error.statusCode || 500;
    const message =
        error.message || "Internal Server Error. Please try again later.";

    res.status(statusCode).json({
        success: false,
        message,
        ...(error.errors && { errors: error.errors }),
        ...(!isProd && { stack: error.stack }),
    });
}

module.exports = errorHandler;