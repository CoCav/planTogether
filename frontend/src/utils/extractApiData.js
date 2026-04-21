/* ==================================================
   API RESPONSE HELPER
   Extracts useful data from Axios API responses
   and handles different possible response structures
================================================== */

/* =========================
   Extract API data
   - Returns response.data[key] if a key is provided
   - Otherwise returns response.data
   - Falls back to an empty array if response is invalid
========================= */
export const extractApiData = (response = {}, key = "") => {
    if (!response || !response.data) return [];

    // If a specific key exists (e.g. events, members, organizers)
    if (key && response.data[key]) {
        return response.data[key];
    }

    return response.data;
};