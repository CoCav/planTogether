import { describe, expect, it } from "vitest";

import { MY_EVENT_FILTER_QUERY_KEYS, getDefaultMyEventFilters } from "../../../../features/users/authenticated/myEventFilters";

/* ==================================================
   MY EVENT FILTERS TESTS
   Tests current user event listing filters

   Handles:
   - current user default filters
   - current user query keys
================================================== */

describe("myEventFilters", () => {

    /* =============================
       DEFAULT FILTERS
    ============================= */

    it("should return default current user event filters", () => {
        expect(getDefaultMyEventFilters()).toEqual({
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
            order: "asc",
            view: ""
        });
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
            "status",
            "date",
            "startDate",
            "endDate",
            "sortBy",
            "order"
        ]);
    });
});
