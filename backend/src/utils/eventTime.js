/* ==================================================
   EVENT TIME HELPERS
   Centralizes all time-based business rules for events
================================================== */

/**
 * Business rule:
 * An event is considered "past" when its endDateTime
 * is strictly earlier than the current date and time.
 *
 * Once an event is past, no action is allowed:
 * - join is forbidden
 * - leave is forbidden
 * - role updates are forbidden
 * - member removal is forbidden
 * - event update is forbidden
 * - event deletion is forbidden
 *
 * This file exists to:
 * - avoid duplicating date comparison logic
 * - ensure consistent behavior across services
 * - keep business rules explicit and maintainable
 */


// Returns true if the given event has already ended.
const isEventPast = (event) => {
    if (!event || !event.endDateTime) {
        return false;
    }

    return new Date(event.endDateTime) < new Date();
};

// Returns the current status of an event.
const getEventStatus = (event) => {
    return isEventPast(event) ? 'past' : 'upcoming';
};

// Throws an error if the event is already past.
const assertEventNotPast = (event) => {
    if (isEventPast(event)) {
        const error = new Error("No action is allowed on a past event");
        error.statusCode = 403;
        throw error;
    }
};

module.exports = { isEventPast, getEventStatus, assertEventNotPast };