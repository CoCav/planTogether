import { describe, expect, it } from "vitest";

import {
    EVENT_MODES,
    VALID_EVENT_MODES,
    EVENT_MODE_LABELS,
    getEventModeLabel
} from "../../../../features/shared/constants/eventModes";

/* ==================================================
   EVENT MODE CONSTANTS TESTS
   Tests shared event mode constants and display helpers

   Handles:
   - event mode values
   - valid event mode allowlist
   - event mode display labels
   - event mode display helper
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

    /* =============================
       EVENT MODE LABELS
    ============================= */

    it("should expose display labels for event modes", () => {
        expect(EVENT_MODE_LABELS).toEqual({
            online: "Online",
            in_person: "In person"
        });
    });

    /* =============================
       DISPLAY HELPERS
    ============================= */

    it("should resolve online display label", () => {
        expect(
            getEventModeLabel(EVENT_MODES.ONLINE)
        ).toBe("Online");
    });

    it("should resolve in-person display label", () => {
        expect(
            getEventModeLabel(EVENT_MODES.IN_PERSON)
        ).toBe("In person");
    });

    it("should fallback to raw mode when label does not exist", () => {
        expect(
            getEventModeLabel("custom_mode")
        ).toBe("custom_mode");
    });
});
