import apiClient from "../apiClient";
import { unwrapApiResponse } from "../apiResponse";

/* ==================================================
   LOCATION API
   Handles authenticated location search requests

   Routes:
   - GET /locations/search

   Notes:
   - location search is protected by the backend
   - results come from backend cache or provider
   - used for event form map preview and future autocomplete
================================================== */

/* =============================
   SEARCH LOCATIONS
============================= */

// Searches locations by text query
export const searchLocations = async (query) => {
    const response = await apiClient.get("/locations/search", {
        params: {
            q: query
        }
    });

    return unwrapApiResponse(response);
};
