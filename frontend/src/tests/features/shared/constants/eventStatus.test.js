import { describe, expect, it } from "vitest";

import { EVENT_STATUS } from "../../../../features/shared/constants/eventStatus";

/* ==================================================
   EVENT STATUS CONSTANTS TESTS
   Tests shared event status constants

   Handles:
   - event status values
================================================== */

describe("eventStatus", () => {

    /* =============================
       EVENT STATUS
    ============================= */

    it("should expose supported event status values", () => {
        expect(EVENT_STATUS).toEqual({
            UPCOMING: "upcoming",
            PAST: "past"
        });
    });
});
