/* ==================================================
   STRING FORMATTER

   Handles:
   - reusable string normalization
   - email normalization
   - stable search/cache key normalization

   Notes:
   - keeps services consistent
   - avoids duplicated trim/lowercase logic
================================================== */

// Normalizes raw string values
const normalizeString = (value) => {
    return String(value ?? "").trim();
};

// Normalizes email before persistence or lookup
const normalizeEmail = (email) => {
    return normalizeString(email).toLowerCase();
};

// Normalizes text for stable search/cache lookups
const normalizeSearchKey = (value) => {
    return normalizeString(value).toLowerCase();
};

module.exports = {
    normalizeString,
    normalizeEmail,
    normalizeSearchKey
};
