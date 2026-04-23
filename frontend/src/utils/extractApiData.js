/* ==================================================
   API RESPONSE HELPER
   Extracts useful data from API responses
   Supports both raw Axios responses and already-unwrapped payloads
================================================== */

/* =========================
   Extract API data
   - Supports raw Axios responses: response.data
   - Supports already-unwrapped payloads
   - Returns payload[key] when a key is provided
   - Returns the full payload otherwise
   - Falls back to an empty array if nothing usable is found
========================= */
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