const { EVENT_STATUS } = require("../../constants/eventStatus");
const { throwHttpError } = require("../errors/httpError");

/* ==========================================================================
   Event Status

   Provides event status helpers and time-based business rules.

   Responsibilities
   - Determine the current event status
   - Check whether an event has started or ended
   - Enforce time-based business rules

   Notes
   - All event time comparisons are centralized here.
   - Event statuses use shared constants.
=========================================================================== */

/* Status helpers */

// Return true when the event start date has been reached.
const hasEventStarted = (event) => {
    if (!event || !event.startDateTime) return false;

    return new Date(event.startDateTime) <= new Date();
};

// Return true when the event end date has passed.
const isEventPast = (event) => {
    if (!event || !event.endDateTime) return false;

    return new Date(event.endDateTime) < new Date();
};

// Determine the current lifecycle status of an event.
const getEventStatus = (event) => {
    if (isEventPast(event)) {
        return EVENT_STATUS.PAST;
    }

    if (hasEventStarted(event)) {
        return EVENT_STATUS.ONGOING;
    }

    return EVENT_STATUS.UPCOMING;
};

/* Business rules */

// Prevent modifications on past events.
const assertEventNotPast = (event) => {
    if (isEventPast(event)) {
        throwHttpError(403, "No action is allowed on a past event");
    }
};

// Prevent deleting events that have already started.
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
