const {
    EVENT_STATUS,
    VALID_EVENT_STATUS
} = require("../../../src/constants/eventStatus");

/* ==========================================================================
   Event Status Constants Unit Tests

   Tests shared event status constants.

   Responsibilities
   - Test supported event status values
   - Test the valid event status allowlist

   Notes
   - The allowlist must stay aligned with EVENT_STATUS.
=========================================================================== */

describe("eventStatus constants", () => {

    /* =============================
       EVENT STATUS VALUES
    ============================= */

    describe("Event status values", () => {
        it("exposes the supported event statuses", () => {
            expect(EVENT_STATUS).toEqual({
                UPCOMING: "upcoming",
                ONGOING: "ongoing",
                PAST: "past"
            });
        });
    });

    /* =============================
       VALID EVENT STATUS
    ============================= */

    describe("Valid event status", () => {
        it("includes every supported event status", () => {
            expect(VALID_EVENT_STATUS).toEqual([
                EVENT_STATUS.UPCOMING,
                EVENT_STATUS.ONGOING,
                EVENT_STATUS.PAST
            ]);
        });
    });
});
