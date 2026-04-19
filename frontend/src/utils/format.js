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