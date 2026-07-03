/* ==================================================
   FORMATTERS
   Provides reusable UI formatting helpers

   Handles:
   - dates and times
   - event date ranges
   - review dates
   - count and text labels
   - provider location formatting
   - multi-line map popup addresses
   - inline location summaries
   - external Google Maps links

   Notes:
   - shared across multiple frontend features
   - formatting helpers should remain presentation-focused
================================================== */

/* =============================
   DATE / TIME
============================= */

// Formats a date string
export const formatDate = (date, locale = "en-GB") => {
    if (!date) return "No date";

    return new Date(date).toLocaleDateString(locale);
};

// Formats a time string
export const formatTime = (date, locale = "en-GB") => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit"
    });
};

// Formats an event date range
export const formatEventDateRange = (start, end) => {
    if (!start) return "No date";

    const startDate = formatDate(start);
    const endDate = formatDate(end);

    if (!end || startDate === endDate) {
        return startDate;
    }

    return `${startDate} → ${endDate}`;
};

/* =============================
   TEXT HELPERS
============================= */

// Formats singular/plural labels
export const formatCount = (count, singular, plural = `${singular}s`) => {
    return `${count} ${count === 1 ? singular : plural}`;
};

// Formats the verb "to be"
export const formatBe = (count) => {
    return count === 1 ? "is" : "are";
};

/* =============================
   LOCATION HELPERS
============================= */

// Builds readable address parts from structured location fields
export const getStructuredLocationParts = (location = {}) => {
    return [
        location.streetAddress,
        location.city,
        location.region,
        location.country
    ].filter(Boolean);
};

// Extracts useful parts from provider labels when structured fields are missing
const getProviderLocationParts = (label = "") => {
    if (!label) return [];

    const parts = String(label)
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);

    if (parts.length <= 3) return parts;

    return [
        parts[0],
        parts[1],
        parts.slice(-3).join(", ")
    ].filter(Boolean);
};

// Resolves display-ready location parts from structured fields or provider label
export const getLocationDisplayParts = (location = {}) => {
    const structuredParts = getStructuredLocationParts(location);

    if (structuredParts.length > 0) {
        return structuredParts;
    }

    return getProviderLocationParts(
        location.locationLabel ||
        location.label ||
        location.location ||
        ""
    );
};

// Formats location for inline display
export const formatLocationInlineLabel = (location = {}) => {
    return getLocationDisplayParts(location).join(", ");
};

// Formats location for multi-line display
export const formatLocationDisplayLabel = (location = {}) => {
    return getLocationDisplayParts(location).join("\n");
};

// Formats the value stored in the input after selecting a suggestion
export const formatLocationSelectionLabel = (location = {}) => {
    return location.label || formatLocationInlineLabel(location);
};

// Builds a Google Maps URL from coordinates
export const buildGoogleMapsUrl = (lat, lng) => {
    return `https://www.google.com/maps?q=${lat},${lng}`;
};

/* =============================
   REVIEW HELPERS
============================= */

// Formats review dates
export const formatReviewDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
};
