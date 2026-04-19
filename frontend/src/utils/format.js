/* ==================================================
   FORMAT UTILS
    This file provides reusable formatting helpers
    for UI display (dates, counts, labels, etc.)
================================================== */

/* =========================
   Date formatting
    Formats a date string into a readable format
    Default locale: en-GB (DD/MM/YYYY)
========================= */
export const formatDate = (date, locale = "en-GB") => {
    if (!date) return "No date";

    return new Date(date).toLocaleDateString(locale);
};

/* =========================
   Time formatting
    Formats time (HH:mm)
========================= */
export const formatTime = (date, locale = "en-GB") => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
    });
};

/* =========================
   Event date range formatting
    Handles:
    - single day events
    - multi-day events
========================= */
export const formatEventDateRange = (start, end) => {
    if (!start) return "No date";

    const startDate = formatDate(start);
    const endDate = formatDate(end);

    // Same day
    if (!end || startDate === endDate) {
        return startDate;
    }

    // Multi-day
    return `${startDate} → ${endDate}`;
};

/* =========================
   Count formatting
    Returns a properly formatted label with singular / plural
    Example: 1 member / 2 members
========================= */
export const formatCount = (count, singular, plural = `${singular}s`) => {return `${count} ${count > 1 ? plural : singular}`};

/* =========================
   Verb agreement helper
    Returns correct verb form based on count
    Example: 1 is / 2 are
========================= */
export const formatBe = (count) => { return count > 1 ? "are" : "is" };