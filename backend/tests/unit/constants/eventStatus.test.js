/* ==================================================
   EVENT STATUS CONSTANTS TESTS

   Tests:
   - event status values

   Ensures:
   - shared event status constants stay consistent
================================================== */

const { EVENT_STATUS } = require("../../../src/constants/eventStatus");

describe("eventStatus constants", () => {
    it("should expose supported event status values", () => {
        expect(EVENT_STATUS).toEqual({
            UPCOMING: "upcoming",
            PAST: "past"
        });
    });
});
