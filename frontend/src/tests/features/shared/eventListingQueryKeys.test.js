import { describe, expect, it } from "vitest";

import { EVENT_PAGE_QUERY_KEY, EVENT_VIEW_QUERY_KEY } from "../../../features/shared/eventListingQueryKeys";

/* ==================================================
   EVENT LISTING QUERY KEYS TESTS
   Tests shared event listing URL query keys

   Handles:
   - view query key
   - page query key
================================================== */

describe("eventListingQueryKeys", () => {

    /* =============================
       QUERY KEYS
    ============================= */

    it("should expose shared event listing query keys", () => {
        expect(EVENT_VIEW_QUERY_KEY).toBe("view");
        expect(EVENT_PAGE_QUERY_KEY).toBe("page");
    });
});
