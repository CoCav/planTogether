/* ==================================================
   USER EVENT EMPTY STATES
   Builds contextual empty states for current user event pages

   Handles:
   - filter-based empty messages
   - date-specific empty messages
   - current user view-based empty messages

   Notes:
   - aligned with current user event views
================================================== */

/* =============================
   FILTER HELPERS
============================= */

const USER_EVENT_FILTER_KEYS = [
    "search",
    "creator",
    "type",
    "theme",
    "mode",
    "location",
    "status",
    "date",
    "startDate",
    "endDate"
];

// Checks if current user event filters are active
const hasActiveUserEventFilters = (filters = {}) => {
    return USER_EVENT_FILTER_KEYS.some((key) => {
        return String(filters[key] || "").trim() !== "";
    });
};

// Builds the empty state for current user event pages
export const getUserEventEmptyState = ({ filters = {}, activeView = "created" }) => {
    if (filters.date) {
        return {
            title: "No events are scheduled for this date.",
            description: "Try removing the date filter or browsing another view."
        };
    }

    if (filters.startDate || filters.endDate) {
        return {
            title: "No events match this date range.",
            description: "Try adjusting the selected dates."
        };
    }

    if (hasActiveUserEventFilters(filters)) {
        return {
            title: "No events match your filters.",
            description: "Try adjusting or resetting your filters."
        };
    }

    if (activeView === "created") {
        return {
            title: "No created events.",
            description: "Events you create will appear here."
        };
    }

    if (activeView === "createdHistory") {
        return {
            title: "No created history.",
            description: "Past events you created will appear here."
        };
    }

    if (activeView === "joined") {
        return {
            title: "No joined events.",
            description: "Events you join will appear here."
        };
    }

    if (activeView === "joinedHistory") {
        return {
            title: "No joined history.",
            description: "Past events you joined will appear here."
        };
    }

    return {
        title: "No events found.",
        description: "Create or join events to see them here."
    };
};
