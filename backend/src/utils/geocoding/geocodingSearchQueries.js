const { normalizeString } = require("../stringNormalizer");

/* ==========================================================================
   Geocoding Search Queries

   Builds fallback search queries for geocoding providers.

   Responsibilities
   - Normalize location search input
   - Remove postal codes from detailed addresses
   - Build broader fallback queries

   Notes
   - Fallback queries help recover from overly specific addresses.
=========================================================================== */

const POSTAL_CODE_PATTERN = /\b[A-Z]\d[A-Z][ -]?\d[A-Z]\d\b/gi;

const removePostalCode = (query) => {
    return normalizeString(query)
        .replace(POSTAL_CODE_PATTERN, "")
        .replace(/\s+/g, " ")
        .replace(/\s+,/g, ",")
        .replace(/,+/g, ",")
        .replace(/^,\s*|,\s*$/g, "")
        .trim();
};

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

module.exports = { removePostalCode, buildLocationSearchQueries };
