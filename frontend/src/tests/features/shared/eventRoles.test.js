import { describe, expect, it } from "vitest";

import { EVENT_ROLES, VALID_EVENT_ROLES } from "../../../features/shared/eventRoles";

/* ==================================================
   EVENT ROLE CONSTANTS TESTS
   Tests shared event role constants

   Handles:
   - event role values
   - valid event role allowlist
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
});
