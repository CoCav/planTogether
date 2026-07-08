/* ==========================================================================
   Event Role Constants

   Defines event participation roles.

   Responsibilities
   - Define available event roles
   - Expose reusable role values
   - Expose valid event roles
   - Expose staff event roles

   Notes
   - Shared across models, services, validators and tests.
=========================================================================== */

const EVENT_ROLES = {
    ORGANIZER: "organizer",
    CO_ORGANIZER: "co_organizer",
    PARTICIPANT: "participant"
};

const EVENT_ROLE_VALUES = Object.values(EVENT_ROLES);

const VALID_EVENT_ROLES = EVENT_ROLE_VALUES;

const STAFF_EVENT_ROLES = [
    EVENT_ROLES.ORGANIZER,
    EVENT_ROLES.CO_ORGANIZER
];

module.exports = {
    EVENT_ROLES,
    EVENT_ROLE_VALUES,
    VALID_EVENT_ROLES,
    STAFF_EVENT_ROLES
};
