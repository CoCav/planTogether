const geocodingConfig = require("../../config/geocoding");

const { throwHttpError } = require("../errors/httpError");
const { normalizeSearchKey } = require("../stringNormalizer");

/* ==========================================================================
   Geocoding Normalizer

   Normalizes provider responses into internal location data.

   Responsibilities
   - Validate provider coordinates
   - Normalize structured address fields
   - Normalize provider location results
   - Attach provider metadata

   Notes
   - Throws a 502 error when the provider response is invalid.
=========================================================================== */

const GEOCODING_PROVIDER = geocodingConfig.provider;

const ROAD_ADDRESS_KEYS = [
    "road",
    "pedestrian",
    "footway",
    "path",
    "street",
    "residential"
];

const CITY_ADDRESS_KEYS = [
    "city",
    "town",
    "village",
    "municipality",
    "hamlet"
];

const REGION_ADDRESS_KEYS = [
    "state",
    "province",
    "region",
    "county"
];

// Return the first available value for the provided address keys.
const pickAddressValue = (address = {}, keys = []) => {
    for (const key of keys) {
        if (address[key]) {
            return address[key];
        }
    }

    return null;
};

// Build a readable street address from provider address fields.
const buildStreetAddress = (address = {}) => {
    const road = pickAddressValue(address, ROAD_ADDRESS_KEYS);

    if (!road) {
        return null;
    }

    return address.house_number
        ? `${address.house_number} ${road}`
        : road;
};

// Normalize the provider address into the application's address format.
const normalizeAddress = (address = {}) => ({
    streetAddress: buildStreetAddress(address),
    city: pickAddressValue(address, CITY_ADDRESS_KEYS),
    region: pickAddressValue(address, REGION_ADDRESS_KEYS),
    postalCode: address.postcode ?? null,
    country: address.country ?? null
});

const normalizeLocation = (query, result = {}) => {
    const latitude = Number(result.lat);
    const longitude = Number(result.lon);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
        throwHttpError(502, "Invalid location provider response");
    }

    const address = normalizeAddress(result.address);

    return {
        query: normalizeSearchKey(query),
        label: result.display_name ?? query,
        ...address,
        latitude,
        longitude,
        provider: GEOCODING_PROVIDER
    };
};

module.exports = {
    GEOCODING_PROVIDER,
    pickAddressValue,
    buildStreetAddress,
    normalizeAddress,
    normalizeLocation
};
