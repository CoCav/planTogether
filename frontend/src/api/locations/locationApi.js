import apiClient from "../apiClient";
import { unwrapApiResponse } from "../apiResponse";

/* ==================================================
   LOCATION API

   Handles:
   - authenticated location search
   - public location search
   - structured location responses

   Routes:
   - GET /locations/search
   - GET /locations/public-search

   Notes:
   - authenticated search is used for internal app features (event forms, dashboard, protected pages)
   - public search is used for public event pages and maps
   - results come from backend cache or provider
   - location results include structured address fields (streetAddress, city, region, postalCode, country)
================================================== */
/* =============================
   AUTHENTICATED LOCATION SEARCH
============================= */

// Search locations for authenticated app usage
export const searchLocations = async (query) => {
    const response = await apiClient.get("/locations/search", {
        params: {
            q: query
        }
    });

    return unwrapApiResponse(response);
};

/* =============================
   PUBLIC LOCATION SEARCH
============================= */

// Search locations for public pages and maps
export const searchPublicLocations = async (query) => {
    const response = await apiClient.get("/locations/public-search", {
        params: {
            q: query
        }
    });

    return unwrapApiResponse(response);
};
