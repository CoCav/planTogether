/* ==========================================================================
   Event Role Constants

   Defines the available event participation roles.

   Responsibilities
   - Centralize event role values
   - Expose the list of valid event roles

   Notes
   - Shared across services, validators and tests.
=========================================================================== */

const EVENT_ROLES = {
    ORGANIZER: "organizer",
    CO_ORGANIZER: "co_organizer",
    PARTICIPANT: "participant"
};

const VALID_EVENT_ROLES = Object.values(EVENT_ROLES);

module.exports = { EVENT_ROLES, VALID_EVENT_ROLES };
