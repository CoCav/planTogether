const Location = require("../models/locationModel");

const geocodingConfig = require("../config/geocoding");

const { throwHttpError } = require("../utils/errors/httpError");
const {
    normalizeString,
    normalizeSearchKey
} = require("../utils/stringNormalizer");

const { buildNominatimSearchParams } = require("../utils/geocoding/geocodingParams");
const { buildLocationSearchQueries } = require("../utils/geocoding/geocodingSearchQueries");
const {
    GEOCODING_PROVIDER,
    normalizeLocation
} = require("../utils/geocoding/geocodingNormalizer");

/* ==========================================================================
   Geocoding Service

   Handles geocoding business logic.

   Responsibilities
   - Validate location search queries
   - Read cached geocoding results
   - Search the configured geocoding provider
   - Save provider results to cache
   - Resolve event location data

   Notes
   - Cached locations reduce repeated provider requests.
   - searchLocations returns multiple results for autocomplete support.
   - resolveEventLocation returns the best matching location for event persistence.
=========================================================================== */

const LOCATION_QUERY_REQUIRED_ERROR = "Location query is required";
const LOCATION_NOT_FOUND_ERROR = "Location not found";
const GEOCODING_RATE_LIMIT_ERROR = "Location search rate limit exceeded. Please try again later.";
const GEOCODING_SERVICE_UNAVAILABLE_ERROR = "Location search service unavailable";

const HTTP_TOO_MANY_REQUESTS = 429;

const hasStructuredAddressData = (location = {}) => {
    return Boolean(
        location.streetAddress ||
        location.city ||
        location.region ||
        location.postalCode ||
        location.country
    );
};

const findCachedLocations = async (query) => {
    return Location.findAll({
        where: {
            query: normalizeSearchKey(query),
            provider: GEOCODING_PROVIDER
        },
        order: [["createdAt", "ASC"]]
    });
};

const saveLocationsToCache = async (locations = []) => {
    const savedLocations = [];

    for (const location of locations) {
        const [savedLocation, created] = await Location.findOrCreate({
            where: {
                query: location.query,
                provider: location.provider,
                latitude: location.latitude,
                longitude: location.longitude
            },
            defaults: location
        });

        if (!created) {
            await savedLocation.update({
                label: location.label,
                streetAddress: location.streetAddress,
                city: location.city,
                region: location.region,
                postalCode: location.postalCode,
                country: location.country
            });
        }

        savedLocations.push(savedLocation);
    }

    return savedLocations;
};

const searchNominatimLocations = async (query, originalQuery = query) => {
    const params = buildNominatimSearchParams(query);

    const response = await fetch(
        `${geocodingConfig.nominatim.searchUrl}?${params.toString()}`,
        {
            headers: {
                Accept: "application/json",
                "User-Agent": geocodingConfig.nominatim.userAgent
            }
        }
    );

    if (response.status === HTTP_TOO_MANY_REQUESTS) {
        throwHttpError(429, GEOCODING_RATE_LIMIT_ERROR);
    }

    if (!response.ok) {
        throwHttpError(502, GEOCODING_SERVICE_UNAVAILABLE_ERROR);
    }

    const results = await response.json();

    if (!Array.isArray(results) || results.length === 0) {
        return [];
    }

    // Cache fallback results under the original user query.
    return results.map((result) =>
        normalizeLocation(originalQuery, result)
    );
};

const searchProviderLocationsWithFallbacks = async (query) => {
    const searchQueries = buildLocationSearchQueries(query);

    for (const searchQuery of searchQueries) {
        const locations = await searchNominatimLocations(searchQuery, query);

        if (locations.length > 0) {
            return locations;
        }
    }

    throwHttpError(404, LOCATION_NOT_FOUND_ERROR);
};

const searchLocations = async (query) => {
    const cleanQuery = normalizeString(query);

    if (!cleanQuery) {
        throwHttpError(400, LOCATION_QUERY_REQUIRED_ERROR);
    }

    const cachedLocations = await findCachedLocations(cleanQuery);

    if (
        cachedLocations.length > 0 &&
        cachedLocations.some(hasStructuredAddressData)
    ) {
        return cachedLocations;
    }

    const providerLocations = await searchProviderLocationsWithFallbacks(cleanQuery);

    return saveLocationsToCache(providerLocations);
};

const resolveEventLocation = async (query) => {
    const locations = await searchLocations(query);

    return locations[0] ?? null;
};

module.exports = {
    searchLocations,
    resolveEventLocation
};
