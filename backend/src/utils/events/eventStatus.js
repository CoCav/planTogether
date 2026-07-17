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

/* =============================
   STATUS ERRORS
============================= */

const PAST_EVENT_ACTION_ERROR = "No action is allowed on a past event";
const STARTED_EVENT_DELETION_ERROR = "An event that has already started cannot be deleted";

/* =============================
   STATUS HELPERS
============================= */

// Check whether an event has started
const hasEventStarted = (event) => {
    if (!event || !event.startDateTime) return false;

    return new Date(event.startDateTime) <= new Date();
};

// Check whether an event has ended
const isEventPast = (event) => {
    if (!event || !event.endDateTime) return false;

    return new Date(event.endDateTime) < new Date();
};

// Determine the current lifecycle status of an event
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
   TIME-BASED BUSINESS RULES
============================= */

// Prevent actions on past events
const assertEventNotPast = (event) => {
    if (isEventPast(event)) {
        throwHttpError(403, PAST_EVENT_ACTION_ERROR);
    }
};

// Prevent deletion after an event has started
const assertEventNotStarted = (event) => {
    if (hasEventStarted(event)) {
        throwHttpError(403, STARTED_EVENT_DELETION_ERROR);
    }
};

module.exports = {
    hasEventStarted,
    isEventPast,
    getEventStatus,
    assertEventNotPast,
    assertEventNotStarted
};
