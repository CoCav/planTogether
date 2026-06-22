/* ==================================================
   API RESPONSE HELPERS
   Helpers for working with standardized backend responses

   Backend responses usually include:
   - success
   - message
   - resource payloads (user, event, events, members...)
   - pagination metadata
================================================== */

// Extracts the backend payload from an Axios response
export const unwrapApiResponse = (response = {}) => {
    return response?.data ?? response;
};

// Extracts a specific property from the backend payload
export const getApiPayload = (response = {}, key = "") => {
    const payload = unwrapApiResponse(response);

    if (!key) {
        return payload;
    }

    return payload?.[key];
};

// Normalizes paginated backend responses
export const getPaginatedPayload = (response = {}, key = "") => {
    const payload = unwrapApiResponse(response);

    return {
        items: key ? payload?.[key] ?? [] : [],
        pagination: {
            page: payload?.page ?? 1,
            pageSize: payload?.pageSize ?? null,
            totalItems:
                payload?.totalItems ??
                payload?.totalEvents ??
                payload?.totalReviews ??
                0,
            totalPages: payload?.totalPages ?? 1
        },
        success: payload?.success ?? false,
        message: payload?.message ?? ""
    };
};
