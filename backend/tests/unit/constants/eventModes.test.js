const {
    EVENT_MODES,
    VALID_EVENT_MODES
} = require("../../../src/constants/eventModes");

/* ==========================================================================
   Event Mode Constants Unit Tests

   Tests shared event mode constants.

   Responsibilities
   - Test supported event mode values
   - Test the valid event mode allowlist

   Notes
   - The allowlist must stay aligned with EVENT_MODES.
=========================================================================== */

describe("eventModes constants", () => {

    /* =============================
       EVENT MODE VALUES
    ============================= */

    describe("Event mode values", () => {
        it("exposes the supported event modes", () => {
            expect(EVENT_MODES).toEqual({
                ONLINE: "online",
                IN_PERSON: "in_person"
            });
        });
    });

    /* =============================
       VALID EVENT MODES
    ============================= */

    describe("Valid event modes", () => {
        it("includes every supported event mode", () => {
            expect(VALID_EVENT_MODES).toEqual([
                EVENT_MODES.ONLINE,
                EVENT_MODES.IN_PERSON
            ]);
        });
    });
});
