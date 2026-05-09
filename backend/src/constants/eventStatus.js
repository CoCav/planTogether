/* ==================================================
   EVENT STATUS CONSTANTS

   Handles:
   - shared event status values

   Notes:
   - centralizes reusable event status strings
   - prevents duplicated status values across services and tests
================================================== */

const EVENT_STATUS = {
    UPCOMING: "upcoming",
    PAST: "past"
};

module.exports = { EVENT_STATUS };
