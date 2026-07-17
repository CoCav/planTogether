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

/* =============================
   EVENT ROLES
============================= */

const EVENT_ROLES = {
    ORGANIZER: "organizer",
    CO_ORGANIZER: "co_organizer",
    PARTICIPANT: "participant"
};

/* =============================
   VALID EVENT ROLES
============================= */

const VALID_EVENT_ROLES = Object.values(EVENT_ROLES);

/* =============================
   STAFF EVENT ROLES
============================= */

const STAFF_EVENT_ROLES = [
    EVENT_ROLES.ORGANIZER,
    EVENT_ROLES.CO_ORGANIZER
];

module.exports = {
    EVENT_ROLES,
    VALID_EVENT_ROLES,
    STAFF_EVENT_ROLES
};
