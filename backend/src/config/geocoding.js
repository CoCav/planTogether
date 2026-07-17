/* ==========================================================================
   Geocoding Configuration

   Configures the geocoding provider.

   Responsibilities
   - Select the geocoding provider
   - Configure provider endpoints
   - Configure request user agent
   - Configure result limits

   Notes
   - Nominatim is the default provider.
   - Values can be overridden through environment variables.
=========================================================================== */

/* =============================
   DEFAULT VALUES
============================= */

const DEFAULT_GEOCODING_PROVIDER = "nominatim";
const DEFAULT_NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";
const DEFAULT_GEOCODING_USER_AGENT = "PlanTogether/1.0";
const DEFAULT_GEOCODING_RESULT_LIMIT = 5;

/* =============================
   GEOCODING CONFIGURATION
============================= */

const geocodingConfig = {
    provider:
        process.env.GEOCODING_PROVIDER ||
        DEFAULT_GEOCODING_PROVIDER,

    nominatim: {
        searchUrl:
            process.env.NOMINATIM_SEARCH_URL ||
            DEFAULT_NOMINATIM_SEARCH_URL,

        userAgent:
            process.env.GEOCODING_USER_AGENT ||
            DEFAULT_GEOCODING_USER_AGENT,

        resultLimit: Number(
            process.env.GEOCODING_RESULT_LIMIT ||
            DEFAULT_GEOCODING_RESULT_LIMIT
        )
    }
};

module.exports = geocodingConfig;
