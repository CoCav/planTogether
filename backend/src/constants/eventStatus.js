/* ==================================================
   EVENT STATUS CONSTANTS

   Handles:
   - shared event status values
   - valid event status allowlist

   Notes:
   - centralizes reusable event status strings
   - prevents duplicated status values across services, validators and tests
================================================== */

const EVENT_STATUS = {
    UPCOMING: "upcoming",
    ONGOING: "ongoing",
    PAST: "past"
};

const VALID_EVENT_STATUS = Object.values(EVENT_STATUS);

module.exports = { EVENT_STATUS, VALID_EVENT_STATUS };
