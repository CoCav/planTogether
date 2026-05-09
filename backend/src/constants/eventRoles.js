/* ==================================================
   EVENT ROLE CONSTANTS

   Handles:
   - shared event role values
   - valid event role allowlist

   Notes:
   - prevents duplicated role strings across services, validators and tests
   - keeps role names consistent across the backend
================================================== */

const EVENT_ROLES = {
    ORGANIZER: "organizer",
    CO_ORGANIZER: "co_organizer",
    PARTICIPANT: "participant"
};

const VALID_EVENT_ROLES = Object.values(EVENT_ROLES);

module.exports = { EVENT_ROLES, VALID_EVENT_ROLES };
