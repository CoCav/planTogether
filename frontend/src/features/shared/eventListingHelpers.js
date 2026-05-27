import { EVENT_STATUS } from "./constants/eventStatus";

/* ==================================================
   EVENT LISTING HELPERS
   Provides shared event listing and filtering helpers

   Handles:
   - event sorting
   - quick date filters
   - weekend filter helpers
   - shared event listing utilities

   Notes:
   - shared between public events and current user events
================================================== */

/* =============================
   DATE HELPERS
============================= */

// Formats a Date object as YYYY-MM-DD
const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

/* =============================
   SORT OPTIONS
============================= */

export const EVENT_SORT_MAP = {
    "startDateTime-asc": {
        sortBy: "startDateTime",
        order: "asc"
    },

    "startDateTime-desc": {
        sortBy: "startDateTime",
        order: "desc"
    },

    "title-asc": {
        sortBy: "title",
        order: "asc"
    },

    "title-desc": {
        sortBy: "title",
        order: "desc"
    },

    "createdAt-desc": {
        sortBy: "createdAt",
        order: "desc"
    },

    "createdAt-asc": {
        sortBy: "createdAt",
        order: "asc"
    }
};

// Returns sort labels adapted to the active view
export const getSortLabels = (view) => {
    if (view === EVENT_STATUS.PAST) {
        return {
            "startDateTime-asc": "Oldest first",
            "startDateTime-desc": "Most recent",

            "title-asc": "Title A-Z",
            "title-desc": "Title Z-A",

            "createdAt-desc": "Newest created",
            "createdAt-asc": "Oldest created"
        };
    }

    if (view === EVENT_STATUS.ONGOING) {
        return {
            "startDateTime-asc": "Started earliest",
            "startDateTime-desc": "Started most recently",

            "title-asc": "Title A-Z",
            "title-desc": "Title Z-A",

            "createdAt-desc": "Newest created",
            "createdAt-asc": "Oldest created"
        };
    }

    return {
        "startDateTime-asc": "Soonest first",
        "startDateTime-desc": "Farthest first",

        "title-asc": "Title A-Z",
        "title-desc": "Title Z-A",

        "createdAt-desc": "Newest created",
        "createdAt-asc": "Oldest created"
    };
};

/* =============================
   TODAY FILTERS
============================= */

// Builds filters for today's events
export const getTodayEventFilters = (currentFilters = {}) => {
    const today = formatDateForInput(new Date());

    return {
        ...currentFilters,
        date: today,
        startDate: "",
        endDate: ""
    };
};

/* =============================
   WEEKEND FILTERS
============================= */

// Returns the current weekend date range
export const getCurrentWeekendDateRange = () => {
    const now = new Date();
    const day = now.getDay();

    const saturday = new Date(now);

    saturday.setDate(now.getDate() + ((6 - day + 7) % 7));

    const sunday = new Date(saturday);

    sunday.setDate(saturday.getDate() + 1);

    return {
        startDate: formatDateForInput(saturday),
        endDate: formatDateForInput(sunday)
    };
};

// Checks if the current weekend filter is active
export const isCurrentWeekendFilterActive = (filters = {}) => {
    const weekend = getCurrentWeekendDateRange();

    return (
        filters.startDate === weekend.startDate &&
        filters.endDate === weekend.endDate
    );
};

// Builds filters for current weekend events
export const getWeekendEventFilters = (currentFilters = {}) => {
    const weekend = getCurrentWeekendDateRange();

    return {
        ...currentFilters,
        date: "",
        startDate: weekend.startDate,
        endDate: weekend.endDate
    };
};
