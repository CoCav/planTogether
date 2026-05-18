import { EVENT_STATUS } from "../shared/eventStatus";

/* ==================================================
   EVENT EMPTY STATES
   Builds contextual empty states for public event pages

   Handles:
   - filter-based empty messages
   - date-specific empty messages
   - public view-based empty messages

   Notes:
   - current user event empty states belong to features/users
================================================== */

const EVENT_FILTER_KEYS = [
    "search",
    "creator",
    "creatorId",
    "type",
    "theme",
    "mode",
    "location",
    "status",
    "date",
    "startDate",
    "endDate"
];

// Checks if public event filters are active
const hasActiveEventFilters = (filters = {}) => {
    return EVENT_FILTER_KEYS.some((key) => {
        return String(filters[key] || "").trim() !== "";
    });
};

// Builds the empty state for public event pages
export const getEventEmptyStates = ({ filters = {}, activeView = "all" }) => {
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

    if (hasActiveEventFilters(filters)) {
        return {
            title: "No events match your filters.",
            description: "Try adjusting or resetting your filters."
        };
    }

    if (activeView === EVENT_STATUS.UPCOMING) {
        return {
            title: "No upcoming events.",
            description: "Check back later or create your own event."
        };
    }

    if (activeView === EVENT_STATUS.PAST) {
        return {
            title: "No archived events.",
            description: "Past events will appear here once they are finished."
        };
    }

    return {
        title: "No events found.",
        description: "Create the first event or check back later."
    };
};
