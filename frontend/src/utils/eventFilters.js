/* ==================================================
   EVENT FILTER UTILS
    Helpers for building event filter presets
================================================== */

/* =========================
   Empty filters
    Returns the default filter object
========================= */
export const getDefaultEventFilters = () => ({
    search: "",
    type: "",
    theme: "",
    mode: "",
    location: "",
    date: "",
    startDate: "",
    endDate: ""
});

/* =========================
   Today filter
    Returns filters for events happening today
========================= */
export const getTodayEventFilters = (currentFilters = {}) => {
    const today = new Date().toISOString().slice(0, 10);

    return {
        ...currentFilters,
        date: today,
        startDate: "",
        endDate: "",
    };
};

/* =========================
   Weekend filter
   Returns filters for events happening this weekend
========================= */
export const getWeekendEventFilters = (currentFilters = {}) => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday

    const saturday = new Date(now);
    saturday.setDate(now.getDate() + ((6 - day + 7) % 7));

    const sunday = new Date(saturday);
    sunday.setDate(saturday.getDate() + 1);

    return {
        ...currentFilters,
        date: "",
        startDate: saturday.toISOString().slice(0, 10),
        endDate: sunday.toISOString().slice(0, 10),
    };
};