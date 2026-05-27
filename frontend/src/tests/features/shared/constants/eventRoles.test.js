import { describe, expect, it } from "vitest";

import { EVENT_ROLES, VALID_EVENT_ROLES, EVENT_ROLE_UI } from "../../../../features/shared/constants/eventRoles";

/* ==================================================
   EVENT ROLE CONSTANTS TESTS
   Tests shared event role constants and UI config

   Handles:
   - event role values
   - valid event role allowlist
   - role UI labels
   - role badge variants
================================================== */

describe("eventRoles", () => {

    /* =============================
       EVENT ROLES
    ============================= */

    it("should expose supported event role values", () => {
        expect(EVENT_ROLES).toEqual({
            ORGANIZER: "organizer",
            CO_ORGANIZER: "co_organizer",
            PARTICIPANT: "participant"
        });
    });

    it("should expose all valid event roles", () => {
        expect(VALID_EVENT_ROLES).toEqual([
            "organizer",
            "co_organizer",
            "participant"
        ]);
    });

    /* =============================
       ROLE UI CONFIGURATION
    ============================= */

    it("should expose organizer UI configuration", () => {
        expect(EVENT_ROLE_UI[EVENT_ROLES.ORGANIZER]).toEqual({
            label: "👑 Organizer",
            badgeVariant: "organizer"
        });
    });

    it("should expose co-organizer UI configuration", () => {
        expect(EVENT_ROLE_UI[EVENT_ROLES.CO_ORGANIZER]).toEqual({
            label: "🛡️ Co-organizer",
            badgeVariant: "co-organizer"
        });
    });

    it("should expose participant UI configuration", () => {
        expect(EVENT_ROLE_UI[EVENT_ROLES.PARTICIPANT]).toEqual({
            label: "👤 Participant",
            badgeVariant: "participant"
        });
    });
});
