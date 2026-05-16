import { describe, expect, it } from "vitest";

import { DEFAULT_EVENT_LISTING_FILTERS } from "../../../features/shared/eventListingDefaults";

/* ==================================================
   EVENT LISTING DEFAULTS TESTS
   Tests shared event listing default filters

   Handles:
   - shared search filters
   - shared date filters
   - shared sorting defaults
================================================== */

describe("eventListingDefaults", () => {

    /* =============================
       DEFAULT FILTERS
    ============================= */

    it("should expose shared default event listing filters", () => {
        expect(DEFAULT_EVENT_LISTING_FILTERS).toEqual({
            search: "",
            creator: "",
            type: "",
            theme: "",
            mode: "",
            location: "",
            status: "",
            date: "",
            startDate: "",
            endDate: "",
            sortBy: "",
            order: "asc"
        });
    });
});
