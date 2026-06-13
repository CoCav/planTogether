/* ==================================================
   FORMATTERS
   Provides reusable UI formatting helpers

   Handles:
   - dates and times
   - event date ranges
   - count labels
   - verb agreement
   - location suggestion labels
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

// Formats provider location labels for autocomplete display
export const formatLocationSuggestionLabel = (label = "") => {
    const parts = String(label)
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);

    if (parts.length <= 3) {
        return parts.join(", ");
    }

    return [
        parts[0],
        `${parts[parts.length - 2]}, ${parts[parts.length - 1]}`
    ].join(" • ");
};
