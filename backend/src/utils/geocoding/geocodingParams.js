const geocodingConfig = require("../../config/geocoding");

/* ==========================================================================
   Geocoding Params

   Builds provider request parameters for geocoding searches.

   Responsibilities
   - Build Nominatim search parameters
   - Apply configured result limits

   Notes
   - Nominatim expects string query parameters.
=========================================================================== */

const NOMINATIM_RESPONSE_FORMAT = "json";
const NOMINATIM_ADDRESS_DETAILS_ENABLED = "1";

const buildNominatimSearchParams = (query) => {
    return new URLSearchParams({
        q: query,
        format: NOMINATIM_RESPONSE_FORMAT,
        addressdetails: NOMINATIM_ADDRESS_DETAILS_ENABLED,
        limit: String(geocodingConfig.nominatim.resultLimit)
    });
};

module.exports = { buildNominatimSearchParams };
