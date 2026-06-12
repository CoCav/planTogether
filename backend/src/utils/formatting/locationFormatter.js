const locationConfig = require("../../config/location");

const { throwHttpError } = require("../errors/httpError");
const { normalizeSearchKey } = require("./stringFormatter");

/* ==================================================
   LOCATION FORMATTER
   Provides reusable location formatting helpers

   Handles:
   - provider configuration access
   - Nominatim query parameter generation
   - provider result normalization
   - provider coordinate validation
================================================== */

const LOCATION_PROVIDER = locationConfig.provider;

/* =============================
   NOMINATIM PARAMS
============================= */

// Builds Nominatim search query parameters
const buildNominatimSearchParams = (query) => {
    return new URLSearchParams({
        q: query,
        format: "json",
        limit: String(locationConfig.nominatim.resultLimit)
    });
};

/* =============================
   RESULT NORMALIZATION
============================= */

// Converts one provider result into internal location data
const formatProviderLocation = (query, result = {}) => {
    const latitude = Number(result.lat);
    const longitude = Number(result.lon);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
        throwHttpError(502, "Invalid location provider response");
    }

    return {
        query: normalizeSearchKey(query),
        label: result.display_name ?? query,
        latitude,
        longitude,
        provider: LOCATION_PROVIDER
    };
};

module.exports = {
    LOCATION_PROVIDER,
    buildNominatimSearchParams,
    formatProviderLocation
};
