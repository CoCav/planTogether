/* ==================================================
   EVENT MODE CONSTANTS

   Handles:
   - shared event mode values
   - valid event mode allowlist

   Notes:
   - centralizes reusable event mode strings
   - prevents duplicated mode values across validators and services
================================================== */

const EVENT_MODES = {
    ONLINE: "online",
    IN_PERSON: "in_person"
};

const VALID_EVENT_MODES = Object.values(EVENT_MODES);

module.exports = { EVENT_MODES, VALID_EVENT_MODES };
