/* ==========================================================================
   HTTP Error Utilities

   Creates reusable HTTP errors for services, controllers and middlewares.

   Responsibilities
   - Create Error objects with an HTTP status code
   - Throw HTTP errors directly when needed
   - Keep error handling consistent with the global error handler

   Notes
   - Designed to work with the global errorHandler middleware.
   - Avoids repeating custom Error boilerplate.
=========================================================================== */

/* =============================
   HTTP ERROR CREATION
============================= */

// Create an Error with an attached HTTP status code
const createHttpError = (statusCode, message) => {
    const error = new Error(message);
    error.statusCode = statusCode;

    return error;
};

// Create and immediately throw an HTTP error
const throwHttpError = (statusCode, message) => {
    throw createHttpError(statusCode, message);
};

module.exports = { createHttpError, throwHttpError };
