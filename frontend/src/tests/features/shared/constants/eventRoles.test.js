import { describe, expect, it } from "vitest";
import { Crown, ShieldCheck, User } from "lucide-react";

import { EVENT_ROLES, VALID_EVENT_ROLES, EVENT_ROLE_UI } from "../../../../features/shared/constants/eventRoles";

/* ==================================================
   EVENT ROLE CONSTANTS TESTS
   Tests shared event role constants and UI config

   Handles:
   - event role values
   - valid event role allowlist
   - role UI labels
   - role badge variants
   - role decorative icons
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
            label: "Organizer",
            badgeVariant: "organizer",
            icon: Crown
        });
    });

    it("should expose co-organizer UI configuration", () => {
        expect(EVENT_ROLE_UI[EVENT_ROLES.CO_ORGANIZER]).toEqual({
            label: "Co-organizer",
            badgeVariant: "co-organizer",
            icon: ShieldCheck
        });
    });

    it("should expose participant UI configuration", () => {
        expect(EVENT_ROLE_UI[EVENT_ROLES.PARTICIPANT]).toEqual({
            label: "Participant",
            badgeVariant: "participant",
            icon: User
        });
    });
});
