/* ==================================================
   EVENT ROLE CONSTANTS
   Centralizes shared event role values

   Notes:
   - mirrors backend event role constants
   - used by event memberships, permissions and UI labels
================================================== */

export const EVENT_ROLES = {
    ORGANIZER: "organizer",
    CO_ORGANIZER: "co_organizer",
    PARTICIPANT: "participant"
};

export const VALID_EVENT_ROLES = Object.values(EVENT_ROLES);
