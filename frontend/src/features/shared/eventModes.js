/* ==================================================
   EVENT MODE CONSTANTS
   Centralizes shared event mode values

   Notes:
   - mirrors backend event mode constants
   - used by event validation, forms and UI helpers
================================================== */

export const EVENT_MODES = {
    ONLINE: "online",
    IN_PERSON: "in_person"
};

export const VALID_EVENT_MODES = Object.values(EVENT_MODES);
