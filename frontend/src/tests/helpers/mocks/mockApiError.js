/* ==================================================
   API ERROR MOCK HELPERS

   Handles:
   - generic API errors
   - backend validation errors
   - Axios-like error payloads

   Notes:
   - aligned with frontend API error handling
   - mirrors backend error response structure
================================================== */

/* =============================
   GENERIC API ERRORS
============================= */

// Create a generic API error
export const createMockApiError = ({
    message = "Something went wrong",
    status = 400,
    errors = []
} = {}) => {

    return {
        response: {
            status,

            data: {
                success: false,
                message,
                errors
            }
        }
    };
};

/* =============================
   VALIDATION ERRORS
============================= */

// Create a backend validation error
export const createMockValidationError = ({
    field = "email",
    message = "Invalid field"
} = {}) => {

    return createMockApiError({
        status: 400,

        message: "Validation failed",

        errors: [
            {
                field,
                message
            }
        ]
    });
};

/* =============================
   NETWORK ERRORS
============================= */

// Create a network error
// Create an Axios-like network error
export const createMockNetworkError = (message = "Network Error") => {
    return {
        message,
        response: undefined
    };
};
