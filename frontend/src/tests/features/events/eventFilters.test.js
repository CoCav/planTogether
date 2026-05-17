import { describe, expect, it } from "vitest";

import { getDefaultEventFilters } from "../../../features/events/eventFilters";

import { createEventFilters } from "../../factories/events/eventFiltersFactory";

/* ==================================================
   EVENT FILTERS TESTS
   Tests public event listing filter defaults

   Handles:
   - default public event filters
   - public creatorId filter
   - shared listing filter defaults

   Notes:
   - uses reusable event filter factories
================================================== */

describe("eventFilters", () => {

    /* =============================
       DEFAULT FILTERS
    ============================= */

    it("should return default public event filters", () => {
        expect(getDefaultEventFilters()).toEqual(
            createEventFilters()
        );
    });
});
