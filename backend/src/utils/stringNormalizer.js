/* ==========================================================================
   String Normalizer

   Provides reusable string normalization helpers.

   Responsibilities
   - Normalize raw string values
   - Normalize email addresses
   - Normalize search and cache keys

   Notes
   - Keeps string normalization consistent across the application.
   - Avoids duplicated trim and lowercase logic.
=========================================================================== */

/* =============================
   STRING NORMALIZATION
============================= */

// Normalize a raw string value
const normalizeString = (value) => {
    return String(value ?? "").trim();
};

// Normalize an email before persistence or lookup
const normalizeEmail = (email) => {
    return normalizeString(email).toLowerCase();
};

// Normalize a stable search or cache key
const normalizeSearchKey = (value) => {
    return normalizeString(value).toLowerCase();
};

module.exports = {
    normalizeString,
    normalizeEmail,
    normalizeSearchKey
};
