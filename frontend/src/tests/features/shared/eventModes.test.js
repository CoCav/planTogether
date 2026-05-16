import { describe, expect, it } from "vitest";

import { EVENT_MODES, VALID_EVENT_MODES } from "../../../features/shared/eventModes";

/* ==================================================
   EVENT MODE CONSTANTS TESTS
   Tests shared event mode constants

   Handles:
   - event mode values
   - valid event mode allowlist
================================================== */

describe("eventModes", () => {

    /* =============================
       EVENT MODES
    ============================= */

    it("should expose supported event mode values", () => {
        expect(EVENT_MODES).toEqual({
            ONLINE: "online",
            IN_PERSON: "in_person"
        });
    });

    it("should expose all valid event modes", () => {
        expect(VALID_EVENT_MODES).toEqual([
            "online",
            "in_person"
        ]);
    });
});
