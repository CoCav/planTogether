/* ==================================================
   API RESPONSE HELPERS
   Helpers for working with standardized backend responses

   Backend responses usually include:
   - success
   - message
   - resource payloads (user, event, events, members...)
   - pagination metadata
   - shared pagination shape
   - totalItems fallback from totalEvents / totalReviews
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

// Normalizes paginated backend responses into a shared frontend shape
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
            totalPages: payload?.totalPages ?? 1,
            averageRating: payload?.averageRating ?? null
        },
        success: payload?.success ?? false,
        message: payload?.message ?? ""
    };
};
