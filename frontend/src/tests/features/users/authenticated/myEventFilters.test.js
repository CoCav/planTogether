import { describe, expect, it } from "vitest";

import {
    MY_EVENT_FILTER_QUERY_KEYS,
    getDefaultMyEventFilters,
    getMyEventFilterFields
} from "../../../../features/users/authenticated/myEventFilters";

import { createMyEventFilters } from "../../../factories/users/authenticated/myEventFiltersFactory";

/* ==================================================
   MY EVENT FILTERS TESTS
   Tests current user event listing filters

   Handles:
   - current user default filters
   - current user query keys
   - filter-only field extraction

   Notes:
   - uses reusable current user event filter factories
================================================== */

describe("myEventFilters", () => {

    /* =============================
       DEFAULT FILTERS
    ============================= */

    it("should return default current user event filters", () => {
        expect(getDefaultMyEventFilters()).toEqual(
            createMyEventFilters()
        );
    });

    /* =============================
       QUERY KEYS
    ============================= */

    it("should expose current user event filter query keys", () => {
        expect(MY_EVENT_FILTER_QUERY_KEYS).toEqual([
            "search",
            "creator",
            "type",
            "theme",
            "mode",
            "location",
            "city",
            "region",
            "country",
            "status",
            "date",
            "startDate",
            "endDate",
            "sortBy",
            "order"
        ]);
    });

    /* =============================
       FILTER HELPERS
    ============================= */

    it("should extract filter-only fields from listing params", () => {
        expect(
            getMyEventFilterFields({
                search: "music",
                creator: "John",
                type: "Meetup",
                theme: "Tech",
                mode: "online",
                location: "Montreal",
                city: "Montreal",
                region: "Quebec",
                country: "Canada",
                status: "upcoming",
                date: "2026-05-20",
                startDate: "2026-05-20",
                endDate: "2026-05-21",
                sortBy: "title",
                order: "asc",
                view: "created",
                page: 2,
                unknownField: "ignored"
            })
        ).toEqual({
            search: "music",
            creator: "John",
            type: "Meetup",
            theme: "Tech",
            mode: "online",
            location: "Montreal",
            city: "Montreal",
            region: "Quebec",
            country: "Canada",
            status: "upcoming",
            date: "2026-05-20",
            startDate: "2026-05-20",
            endDate: "2026-05-21"
        });
    });
});
