import { describe, expect, it } from "vitest";

import { getDefaultEventFilters, getEventFilterFields } from "../../../features/events/eventFilters";

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

    /* =============================
       FILTER FILTERS
    ============================= */

    it("should extract filter-only fields from listing params", () => {
        const result = getEventFilterFields({
            search: "react",
            creator: "john",
            type: "workshop",
            theme: "tech",
            mode: "online",
            location: "montreal",
            status: "upcoming",
            date: "2026-05-18",
            startDate: "2026-05-18",
            endDate: "2026-05-19",

            sortBy: "createdAt",
            order: "desc",

            random: "ignored"
        });

        expect(result).toEqual({
            search: "react",
            creator: "john",
            type: "workshop",
            theme: "tech",
            mode: "online",
            location: "montreal",
            status: "upcoming",
            date: "2026-05-18",
            startDate: "2026-05-18",
            endDate: "2026-05-19"
        });
    });
});
