import { Crown, ShieldCheck, User } from "lucide-react";

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
   Shared display labels, badge variants and icons

   Notes:
   - used by Badge and membership UI
   - keeps role display configuration centralized
================================================== */

export const EVENT_ROLE_UI = {
    [EVENT_ROLES.ORGANIZER]: {
        label: "Organizer",
        badgeVariant: "organizer",
        icon: Crown
    },

    [EVENT_ROLES.CO_ORGANIZER]: {
        label: "Co-organizer",
        badgeVariant: "co-organizer",
        icon: ShieldCheck
    },

    [EVENT_ROLES.PARTICIPANT]: {
        label: "Participant",
        badgeVariant: "participant",
        icon: User
    }
};
