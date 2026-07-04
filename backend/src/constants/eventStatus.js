/* ==========================================================================
   Event Status Constants

   Defines the available event lifecycle statuses.

   Responsibilities
   - Centralize event status values
   - Expose the list of valid event statuses

   Notes
   - Shared across services, validators and tests.
=========================================================================== */

const EVENT_STATUS = {
    UPCOMING: "upcoming",
    ONGOING: "ongoing",
    PAST: "past"
};

const VALID_EVENT_STATUS = Object.values(EVENT_STATUS);

module.exports = { EVENT_STATUS, VALID_EVENT_STATUS };
