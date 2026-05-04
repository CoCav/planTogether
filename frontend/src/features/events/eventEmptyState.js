/* ==================================================
   EVENT EMPTY STATES
   Builds contextual empty states for event pages

   Handles:
   - filter-based empty messages
   - date-specific empty messages
   - view-based empty messages
================================================== */

const FILTER_KEYS = [
    "search",
    "creator",
    "type",
    "theme",
    "mode",
    "location",
    "date",
    "startDate",
    "endDate"
];

const hasActiveFilters = (filters = {}) => FILTER_KEYS.some((key) => String(filters[key] || "").trim() !== "");

export const getEventsEmptyState = ({ filters = {}, activeView = "all" }) => {
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

    if (hasActiveFilters(filters)) {
        return {
            title: "No events match your filters.",
            description: "Try adjusting or resetting your filters."
        };
    }

    if (activeView === "upcoming") {
        return {
            title: "No upcoming events.",
            description: "Check back later or create your own event."
        };
    }

    if (activeView === "archives") {
        return {
            title: "No archived events.",
            description: "Past events will appear here once they are finished."
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
        description: "Create the first event or check back later."
    };
};
