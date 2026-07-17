/* ==========================================================================
   Event Mode Constants

   Defines the available event participation modes.

   Responsibilities
   - Centralize event mode values
   - Expose the list of valid event modes

   Notes
   - Shared across validators, services and tests.
=========================================================================== */

/* =============================
   EVENT MODES
============================= */

const EVENT_MODES = {
    ONLINE: "online",
    IN_PERSON: "in_person"
};

/* =============================
   VALID EVENT MODES
============================= */

const VALID_EVENT_MODES = Object.values(EVENT_MODES);

module.exports = { EVENT_MODES, VALID_EVENT_MODES };
