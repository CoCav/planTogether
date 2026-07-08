/* ==========================================================================
   Event Role Constants

   Defines the available event participation roles.

   Responsibilities
   - Centralize event role values
   - Expose valid event roles
   - Expose staff event roles

   Notes
   - Shared across services, validators and tests.
=========================================================================== */

const EVENT_ROLES = {
    ORGANIZER: "organizer",
    CO_ORGANIZER: "co_organizer",
    PARTICIPANT: "participant"
};

const VALID_EVENT_ROLES = Object.values(EVENT_ROLES);

const STAFF_EVENT_ROLES = [
    EVENT_ROLES.ORGANIZER,
    EVENT_ROLES.CO_ORGANIZER
];

module.exports = {
    EVENT_ROLES,
    VALID_EVENT_ROLES,
    STAFF_EVENT_ROLES
};
