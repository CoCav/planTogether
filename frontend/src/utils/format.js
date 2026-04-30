/* ==================================================
   FORMAT UTILS
   Provides reusable UI formatting helpers

   Handles:
   - dates and times
   - event date ranges
   - count labels
   - verb agreement
================================================== */

export const formatDate = (date, locale = "en-GB") => {
    if (!date) return "No date";

    return new Date(date).toLocaleDateString(locale);
};

export const formatTime = (date, locale = "en-GB") => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit"
    });
};

export const formatEventDateRange = (start, end) => {
    if (!start) return "No date";

    const startDate = formatDate(start);
    const endDate = formatDate(end);

    if (!end || startDate === endDate) {
        return startDate;
    }

    return `${startDate} → ${endDate}`;
};

export const formatCount = (count, singular, plural = `${singular}s`) => {
    return `${count} ${count > 1 ? plural : singular}`;
};

export const formatBe = (count) => {
    return count > 1 ? "are" : "is";
};
