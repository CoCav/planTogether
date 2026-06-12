/* ==================================================
   LOCATION CONFIGURATION

   Handles:
   - default location provider selection
   - provider search endpoint configuration
   - provider request user agent
   - provider search result limit

   Notes:
   - Nominatim is the default provider
   - values can be overridden through environment variables
================================================== */

const locationConfig = {
    provider: process.env.LOCATION_PROVIDER || "nominatim",

    nominatim: {
        searchUrl: process.env.NOMINATIM_SEARCH_URL || "https://nominatim.openstreetmap.org/search",

        userAgent: process.env.GEOCODING_USER_AGENT || "PlanTogether/1.0",

        resultLimit: Number(process.env.GEOCODING_RESULT_LIMIT || 5)
    }
};

module.exports = locationConfig;
