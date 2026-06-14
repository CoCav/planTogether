/* ==================================================
   FORMATTERS
   Provides reusable UI formatting helpers

   Handles:
   - dates and times
   - event date ranges
   - count labels
   - verb agreement
   - inline location labels
   - multi-line location labels
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
    return `${count} ${count > 1 ? plural : singular}`;
};

// Formats the verb "to be"
export const formatBe = (count) => {
    return count > 1 ? "are" : "is";
};

/* =============================
   LOCATION HELPERS
============================= */

// Extracts useful location parts from a provider label
const getLocationDisplayParts = (label = "") => {
    const parts = String(label)
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);

    if (parts.length <= 3) {
        return parts;
    }

    const placeName = parts[0];
    const streetOrArea = parts[1];
    const lastParts = parts.slice(-3).join(", ");

    return [
        placeName,
        streetOrArea,
        lastParts
    ].filter(Boolean);
};

// Formats provider location labels for multi-line display
export const formatLocationDisplayLabel = (label = "") => {
    return getLocationDisplayParts(label).join("\n");
};

// Formats provider location labels for inline display
export const formatLocationInlineLabel = (label = "") => {
    return getLocationDisplayParts(label).join(", ");
};
