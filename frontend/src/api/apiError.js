/* ==================================================
   API ERROR HELPERS
   Normalizes Axios/backend errors into a predictable shape

   Prevents repeated usage of:
   - error.response?.data?.message
   - error.response?.status
   - error.response?.data?.errors
================================================== */

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
export const normalizeApiError = (error) => {
    const responseData = error?.response?.data;

    return new ApiError(
        responseData?.message ||
        error?.message ||
        "Something went wrong.",
        {
            status: error?.response?.status ?? null,

            errors: Array.isArray(responseData?.errors)
                ? responseData.errors
                : [],

            cause: error
        }
    );
};

// Returns only a readable API error message
export const getApiErrorMessage = (
    error,
    fallback = "Something went wrong."
) => {
    const normalizedError = normalizeApiError(error);

    return normalizedError.message || fallback;
};
