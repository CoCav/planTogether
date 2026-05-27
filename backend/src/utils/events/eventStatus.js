/* ==================================================
   EVENT STATUS

   Handles:
   - event status computation (upcoming / ongoing / past)
   - event start and end time checks
   - time-based business rules enforcement

   Notes:
   - centralizes all time logic to avoid duplication
   - event statuses are centralized through shared constants
================================================== */

const { EVENT_STATUS } = require("../../constants/eventStatus");
const { throwHttpError } = require("../errors/httpError");

/* =============================
   STATUS HELPERS
============================= */

// Check if event has already started
const hasEventStarted = (event) => {
    if (!event || !event.startDateTime) return false;

    return new Date(event.startDateTime) <= new Date();
};

// Check if event has already ended
const isEventPast = (event) => {
    if (!event || !event.endDateTime) return false;

    return new Date(event.endDateTime) < new Date();
};

// Get event status
const getEventStatus = (event) => {
    if (isEventPast(event)) {
        return EVENT_STATUS.PAST;
    }

    if (hasEventStarted(event)) {
        return EVENT_STATUS.ONGOING;
    }

    return EVENT_STATUS.UPCOMING;
};

/* =============================
   BUSINESS RULES
============================= */

// Prevent actions on past events
const assertEventNotPast = (event) => {
    if (isEventPast(event)) {
        throwHttpError(403, "No action is allowed on a past event");
    }
};

// Prevent deleting events that already started
const assertEventNotStarted = (event) => {
    if (hasEventStarted(event)) {
        throwHttpError(
            403,
            "An event that has already started cannot be deleted"
        );
    }
};

module.exports = {
    hasEventStarted,
    isEventPast,
    getEventStatus,
    assertEventNotPast,
    assertEventNotStarted
};
