/* ==================================================
   EVENT STATUS

   Handles:
   - event status computation (past / upcoming)
   - time-based business rules enforcement

   Notes:
   - centralizes all time logic to avoid duplication
   - event statuses are centralized through shared constants
================================================== */

const { EVENT_STATUS } = require("../../constants/eventStatus");

// Check if event has already ended
const isEventPast = (event) => {
    if (!event || !event.endDateTime) return false;

    return new Date(event.endDateTime) < new Date();
};

// Get event status
const getEventStatus = (event) => {
    return isEventPast(event) ? EVENT_STATUS.PAST : EVENT_STATUS.UPCOMING;
};

// Prevent actions on past events
const assertEventNotPast = (event) => {
    if (isEventPast(event)) {
        const error = new Error("No action is allowed on a past event");
        error.statusCode = 403;
        throw error;
    }
};

module.exports = { isEventPast, getEventStatus, assertEventNotPast };
