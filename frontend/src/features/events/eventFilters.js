/* ==================================================
   EVENT FILTERS
   Provides event filter defaults, presets and sort options

   Handles:
   - default filter values
   - sort mapping and labels
   - quick date filters
================================================== */

const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

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

export const EVENT_SORT_MAP = {
    "startDateTime-asc": { sortBy: "startDateTime", order: "asc" },
    "startDateTime-desc": { sortBy: "startDateTime", order: "desc" },
    "title-asc": { sortBy: "title", order: "asc" },
    "title-desc": { sortBy: "title", order: "desc" }
};

export const getSortLabels = (view) => ({
    "startDateTime-asc": view === "archives" ? "Oldest first" : "Soonest first",
    "startDateTime-desc": view === "archives" ? "Most recent" : "Farthest first",
    "title-asc": "Title A-Z",
    "title-desc": "Title Z-A"
});

export const getTodayEventFilters = (currentFilters = {}) => {
    const today = formatDateForInput(new Date());

    return {
        ...currentFilters,
        date: today,
        startDate: "",
        endDate: ""
    };
};

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

export const isCurrentWeekendFilterActive = (filters = {}) => {
    const weekend = getCurrentWeekendDateRange();

    return (
        filters.startDate === weekend.startDate &&
        filters.endDate === weekend.endDate
    );
};

export const getWeekendEventFilters = (currentFilters = {}) => {
    const weekend = getCurrentWeekendDateRange();

    return {
        ...currentFilters,
        date: "",
        startDate: weekend.startDate,
        endDate: weekend.endDate
    };
};
