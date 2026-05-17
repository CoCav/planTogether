import { describe, expect, it } from "vitest";

import {
    PUBLIC_USER_EVENT_FILTER_QUERY_KEYS,
    getDefaultPublicUserEventFilters
} from "../../../../features/users/public/publicUserEventFilters";

import { createPublicUserEventFilters } from "../../../factories/users/public/publicUserEventFiltersFactory";

/* ==================================================
   PUBLIC USER EVENT FILTERS TESTS
   Tests public user event listing filters

   Handles:
   - public user event default filters
   - public user event query keys

   Notes:
   - uses reusable public user event filter factories
================================================== */

describe("publicUserEventFilters", () => {

    /* =============================
       DEFAULT FILTERS
    ============================= */

    it("should return default public user event filters", () => {
        expect(getDefaultPublicUserEventFilters()).toEqual(
            createPublicUserEventFilters()
        );
    });

    /* =============================
       QUERY KEYS
    ============================= */

    it("should expose public user event filter query keys", () => {
        expect(PUBLIC_USER_EVENT_FILTER_QUERY_KEYS).toEqual([
            "search",
            "type",
            "theme",
            "mode",
            "location",
            "status",
            "date",
            "startDate",
            "endDate",
            "sortBy",
            "order"
        ]);
    });
});
