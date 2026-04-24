/* ===========================================================
   EVENT FILTER UTILS
   Helpers for building event filter presets and sort options
============================================================== */

/* =========================
   Local date formatter
   Converts a Date object to YYYY-MM-DD format using local timezone
   Avoids UTC issues caused by toISOString for date inputs
========================= */
const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

/* =========================
   Default filters
   Returns the default filter object used by the Events page
========================= */
export const getDefaultEventFilters = () => ({
    search: "",
    type: "",
    theme: "",
    mode: "",
    location: "",
    date: "",
    startDate: "",
    endDate: "",
    sortBy: "",
    order: "asc"
});

/* =========================
   Sort mapping
   Maps sort options to backend sortBy + order
========================= */
export const EVENT_SORT_MAP = {
    "startDateTime-asc": { sortBy: "startDateTime", order: "asc" },
    "startDateTime-desc": { sortBy: "startDateTime", order: "desc" },
    "title-asc": { sortBy: "title", order: "asc" },
    "title-desc": { sortBy: "title", order: "desc" }
};

/* =========================
   Sort labels
   Maps sort options to UI labels depending on view
========================= */
export const getSortLabels = (view) => ({
    "startDateTime-asc":
        view === "archives" ? "Oldest first" : "Soonest first",

    "startDateTime-desc":
        view === "archives" ? "Most recent" : "Farthest first",

    "title-asc": "Title A-Z",
    "title-desc": "Title Z-A"
});

/* =========================
   Today filter
   Returns filters for events happening today
========================= */
export const getTodayEventFilters = (currentFilters = {}) => {
    const today = formatDateForInput(new Date());

    return {
        ...currentFilters,
        date: today,
        startDate: "",
        endDate: ""
    };
};

/* =========================
   Current weekend range
   Returns this weekend dates based on today's date
========================= */
export const getCurrentWeekendDateRange = () => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday

    const saturday = new Date(now);
    saturday.setDate(now.getDate() + ((6 - day + 7) % 7));

    const sunday = new Date(saturday);
    sunday.setDate(saturday.getDate() + 1);

    return {
        startDate: formatDateForInput(saturday),
        endDate: formatDateForInput(sunday)
    };
};

/* =========================
   Current weekend active state
   Checks if filters match this weekend exactly
========================= */
export const isCurrentWeekendFilterActive = (filters = {}) => {
    const weekend = getCurrentWeekendDateRange();

    return (
        filters.startDate === weekend.startDate &&
        filters.endDate === weekend.endDate
    );
};

/* =========================
   Weekend filter
   Returns filters for events happening this weekend
========================= */
export const getWeekendEventFilters = (currentFilters = {}) => {
    const weekend = getCurrentWeekendDateRange();

    return {
        ...currentFilters,
        date: "",
        startDate: weekend.startDate,
        endDate: weekend.endDate
    };
};