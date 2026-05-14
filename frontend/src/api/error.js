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
    constructor(message, { status = null, errors = [], originalError = null } = {}) {
        super(message);

        this.name = "ApiError";
        this.status = status;
        this.errors = errors;
        this.originalError = originalError;
    }
}

// Converts an Axios error into a normalized ApiError
export const normalizeApiError = (error) => {
    const responseData = error?.response?.data;

    return new ApiError(
        responseData?.message || error?.message || "Something went wrong.",
        {
            status: error?.response?.status ?? null,
            errors: responseData?.errors ?? [],
            originalError: error,
        }
    );
};

// Returns only a readable error message
export const getApiErrorMessage = (error) => {
    return normalizeApiError(error).message;
};
