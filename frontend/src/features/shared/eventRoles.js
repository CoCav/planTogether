/* ==================================================
   EVENT ROLE CONSTANTS
   Centralizes shared event role values

   Notes:
   - mirrors backend event role constants
   - used by memberships, permissions and UI logic
================================================== */

export const EVENT_ROLES = {
    ORGANIZER: "organizer",
    CO_ORGANIZER: "co_organizer",
    PARTICIPANT: "participant"
};

export const VALID_EVENT_ROLES = Object.values(EVENT_ROLES);

/* ==================================================
   EVENT ROLE UI
   Shared display labels and badge variants

   Notes:
   - used by badge and membership UI
   - centralizes role display configuration
================================================== */

export const EVENT_ROLE_UI = {
    [EVENT_ROLES.ORGANIZER]: {
        label: "👑 Organizer",
        badgeVariant: "organizer"
    },

    [EVENT_ROLES.CO_ORGANIZER]: {
        label: "🛡️ Co-organizer",
        badgeVariant: "co-organizer"
    },

    [EVENT_ROLES.PARTICIPANT]: {
        label: "👤 Participant",
        badgeVariant: "participant"
    }
};
