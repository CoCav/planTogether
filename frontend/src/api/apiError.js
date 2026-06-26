/* ==================================================
   API ERROR HELPERS
   Helpers for working with Axios and backend errors

   Handles:
   - API error normalization
   - API error message extraction
   - HTTP status extraction
   - validation error extraction

   Prevents repeated usage of:
   - error.response?.data?.message
   - error.response?.status
   - error.response?.data?.errors
================================================== */

/* =============================
   ERROR NORMALIZATION
============================= */

// Custom API error class
export class ApiError extends Error {
    constructor(
        message,
        {
            status = null,
            errors = [],
            cause = null
        } = {}
    ) {
        super(message);

        this.name = "ApiError";
        this.status = status;
        this.errors = errors;
        this.cause = cause;
    }
}

// Converts an Axios error into a normalized ApiError
export const normalizeApiError = (error, fallback = "Something went wrong.") => {
    const responseData = error?.response?.data;

    return new ApiError(
        responseData?.message ||
        error?.message ||
        fallback,
        {
            status: error?.response?.status ?? null,

            errors: Array.isArray(responseData?.errors)
                ? responseData.errors
                : [],

            cause: error
        }
    );
};

/* =============================
   ERROR MESSAGES
============================= */

// Returns only a readable API error message
export const getApiErrorMessage = (error, fallback = "Something went wrong.") => {
    return normalizeApiError(error, fallback).message;
};
