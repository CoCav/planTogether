/* ==================================================
   EVENT STATUS CONSTANTS TESTS

   Tests:
   - event status values
   - valid event status allowlist

   Ensures:
   - shared event status constants stay consistent
   - valid event status allowlist stays aligned with supported statuses
================================================== */

const { EVENT_STATUS, VALID_EVENT_STATUS } = require("../../../src/constants/eventStatus");

describe("eventStatus constants", () => {
    it("should expose supported event status values", () => {
        expect(EVENT_STATUS).toEqual({
            UPCOMING: "upcoming",
            ONGOING: "ongoing",
            PAST: "past"
        });
    });

    it("should expose valid event status values", () => {
        expect(VALID_EVENT_STATUS).toEqual([
            EVENT_STATUS.UPCOMING,
            EVENT_STATUS.ONGOING,
            EVENT_STATUS.PAST
        ]);
    });
});
