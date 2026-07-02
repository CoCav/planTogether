const locationConfig = require("../../config/location");

const { throwHttpError } = require("../errors/httpError");
const { normalizeString, normalizeSearchKey } = require("./stringFormatter");

/* ==================================================
   LOCATION FORMATTER
   Provides reusable location formatting helpers

   Handles:
   - provider configuration access
   - Nominatim query parameter generation
   - provider result normalization
   - provider coordinate validation
   - structured address normalization
   - fallback search query generation
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
        addressdetails: "1",
        limit: String(locationConfig.nominatim.resultLimit)
    });
};

/* =============================
   SEARCH FALLBACKS
============================= */

// Removes common postal code patterns from a location query
const removePostalCode = (query) => {
    return normalizeString(query)
        .replace(/\b[A-Z]\d[A-Z][ -]?\d[A-Z]\d\b/gi, "")
        .replace(/\s+/g, " ")
        .replace(/\s+,/g, ",")
        .replace(/,+/g, ",")
        .replace(/^,|,$/g, "")
        .trim();
};

// Builds broader fallback queries from a detailed address
const buildLocationSearchQueries = (query) => {
    const cleanQuery = normalizeString(query);

    if (!cleanQuery) {
        return [];
    }

    const withoutPostalCode = removePostalCode(cleanQuery);

    const parts = withoutPostalCode
        .split(",")
        .map((part) => normalizeString(part))
        .filter(Boolean);

    const broadLocation =
        parts.length >= 3
            ? parts.slice(-3).join(", ")
            : "";

    return Array.from(new Set([
        cleanQuery,
        withoutPostalCode,
        broadLocation
    ].filter(Boolean)));
};

/* =============================
   RESULT NORMALIZATION
============================= */

// Picks the first available address value
const pickAddressValue = (address = {}, keys = []) => {
    for (const key of keys) {
        if (address[key]) {
            return address[key];
        }
    }

    return null;
};

// Builds a readable street address from Nominatim address parts
const buildStreetAddress = (address = {}) => {
    const road = pickAddressValue(address, [
        "road",
        "pedestrian",
        "footway",
        "path",
        "street",
        "residential"
    ]);

    if (!road) {
        return null;
    }

    return address.house_number
        ? `${address.house_number} ${road}`
        : road;
};

// Extracts structured address fields from a Nominatim result
const formatProviderAddress = (address = {}) => ({
    streetAddress: buildStreetAddress(address),

    city: pickAddressValue(address, [
        "city",
        "town",
        "village",
        "municipality",
        "hamlet"
    ]),

    region: pickAddressValue(address, [
        "state",
        "province",
        "region",
        "county"
    ]),

    postalCode: address.postcode ?? null,

    country: address.country ?? null
});

// Converts one provider result into internal location data
const formatProviderLocation = (query, result = {}) => {
    const latitude = Number(result.lat);
    const longitude = Number(result.lon);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
        throwHttpError(502, "Invalid location provider response");
    }

    const address = formatProviderAddress(result.address);

    return {
        query: normalizeSearchKey(query),
        label: result.display_name ?? query,
        ...address,
        latitude,
        longitude,
        provider: LOCATION_PROVIDER
    };
};

module.exports = {
    LOCATION_PROVIDER,
    buildNominatimSearchParams,
    buildLocationSearchQueries,
    pickAddressValue,
    buildStreetAddress,
    formatProviderAddress,
    formatProviderLocation
};
