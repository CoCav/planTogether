const Location = require("../models/locationModel");

const locationConfig = require("../config/location");

const { throwHttpError } = require("../utils/errors/httpError");

const { normalizeString, normalizeSearchKey } = require("../utils/formatting/stringFormatter");

const {
    LOCATION_PROVIDER,
    buildNominatimSearchParams,
    formatProviderLocation
} = require("../utils/formatting/locationFormatter");

/* ==================================================
   LOCATION SERVICE
   Handles location search and geocoding

   Handles:
   - location query validation
   - cached location lookup
   - OpenStreetMap Nominatim provider search
   - location result persistence
   - provider error and rate limit handling
   - reusable coordinates for events and future map features

   Notes:
   - cached locations reduce repeated provider requests
   - searchLocations returns multiple results for future autocomplete support
   - resolveEventLocation returns the best matching location for event persistence
================================================== */

/* =============================
   CACHE LOOKUP
============================= */

// Finds cached locations for a normalized query
const findCachedLocations = async (query) => {
    return Location.findAll({
        where: {
            query: normalizeSearchKey(query),
            provider: LOCATION_PROVIDER
        },
        order: [["createdAt", "ASC"]]
    });
};

// Saves provider results into the location cache
const saveLocationsToCache = async (locations = []) => {
    const savedLocations = [];

    for (const location of locations) {
        const [savedLocation] = await Location.findOrCreate({
            where: {
                query: location.query,
                provider: location.provider,
                latitude: location.latitude,
                longitude: location.longitude
            },
            defaults: location
        });

        savedLocations.push(savedLocation);
    }

    return savedLocations;
};

/* =============================
   PROVIDER SEARCH
============================= */

// Searches matching locations from Nominatim
const searchNominatimLocations = async (query) => {
    const params = buildNominatimSearchParams(query);

    const response = await fetch(
        `${locationConfig.nominatim.searchUrl}?${params.toString()}`,
        {
            headers: {
                Accept: "application/json",
                "User-Agent": locationConfig.nominatim.userAgent
            }
        }
    );

    if (response.status === 429) {
        throwHttpError(
            429,
            "Location search rate limit exceeded. Please try again later."
        );
    }

    if (!response.ok) {
        throwHttpError(502, "Location search service unavailable");
    }

    const results = await response.json();

    if (!Array.isArray(results) || results.length === 0) {
        throwHttpError(404, "Location not found");
    }

    return results.map((result) =>
        formatProviderLocation(query, result)
    );
};

/* =============================
   LOCATION SEARCH
============================= */

// Searches locations from cache first, then provider
const searchLocations = async (query) => {
    const cleanQuery = normalizeString(query);

    if (!cleanQuery) {
        throwHttpError(400, "Location query is required");
    }

    const cachedLocations = await findCachedLocations(cleanQuery);

    if (cachedLocations.length > 0) {
        return cachedLocations;
    }

    const providerLocations = await searchNominatimLocations(cleanQuery);

    return saveLocationsToCache(providerLocations);
};

// Resolves the best matching location for event persistence
const resolveEventLocation = async (query) => {
    const locations = await searchLocations(query);

    return locations[0] ?? null;
};

module.exports = { searchLocations, resolveEventLocation };
