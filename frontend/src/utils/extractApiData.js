/* ==================================================
   API RESPONSE HELPER
   Extracts data from API responses

   Supports:
   - raw Axios responses
   - already-unwrapped payloads
   - optional key-based extraction
================================================== */

export const extractApiData = (response = {}, key = "") => {
    // Support both Axios responses and already-unwrapped payloads
    const payload = response?.data ?? response;

    if (!payload || typeof payload !== "object") {
        return [];
    }

    // Return a specific property if requested
    if (key) {
        return payload[key] ?? [];
    }

    // Otherwise return the full payload
    return payload;
};
