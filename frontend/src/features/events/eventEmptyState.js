/* ==================================================
   EVENT EMPTY STATES
   Helpers for generating contextual empty states
   across event-related pages
================================================== */

export const getEventsEmptyState = ({ filters = {}, activeView = "all" }) => {
    if (filters.date) {
        return {
            title: "No events are scheduled for today.",
            description: "Try removing the date filter or browsing upcoming events.",
        };
    }

    if (filters.startDate || filters.endDate) {
        return {
            title: "No events match this date range.",
            description: "Try adjusting the selected dates.",
        };
    }

    if (activeView === "upcoming") {
        return {
            title: "No upcoming events.",
            description: "Check back later or create your own event.",
        };
    }

    if (activeView === "archives") {
        return {
            title: "No archived events.",
            description: "Past events will appear here once they are finished.",
        };
    }

    return {
        title: "No events found.",
        description: "Try adjusting your filters or search terms.",
    };
};