/* ==================================================
   HTTP ERROR UTILITIES

   Handles:
   - reusable HTTP error creation
   - custom application error throwing
   - statusCode attachment for API responses

   Notes:
   - designed to work with global errorHandler middleware
   - avoids repeating custom Error boilerplate
   - keeps services/controllers cleaner and more consistent
================================================== */

// Create reusable HTTP error objects
const createHttpError = (statusCode, message) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

// Throw reusable HTTP errors directly
const throwHttpError = (statusCode, message) => {
    throw createHttpError(statusCode, message);
};

module.exports = { createHttpError, throwHttpError };
