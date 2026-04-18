
/* =========================
 Date formatting helpers
   Provides reusable formatting functions for UI display
========================= */

export const formatDate = (date, locale = "en-GB") => {
    if (!date) return "No date";

    const newDate = new Date(date)
    return newDate.toLocaleDateString(locale);
};