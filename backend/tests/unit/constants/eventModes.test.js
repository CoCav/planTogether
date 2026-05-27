/* ==================================================
   EVENT MODE CONSTANTS TESTS

   Tests:
   - event mode values
   - valid mode allowlist

   Ensures:
   - shared event mode constants stay consistent
   - valid mode list contains all supported event modes
================================================== */

const { EVENT_MODES, VALID_EVENT_MODES } = require("../../../src/constants/eventModes");

describe("eventModes constants", () => {
    it("should expose supported event mode values", () => {
        expect(EVENT_MODES).toEqual({
            ONLINE: "online",
            IN_PERSON: "in_person"
        });
    });

    it("should expose all valid event modes", () => {
        expect(VALID_EVENT_MODES).toEqual([
            EVENT_MODES.ONLINE,
            EVENT_MODES.IN_PERSON
        ]);
    });
});
