import { describe, expect, it } from "vitest";

import {
    buildMyEventSearchParams,
    getInitialMyEventFiltersFromUrl,
    getInitialMyEventViewFromUrl
} from "../../../../features/users/authenticated/myEventQueryParams";

import { EVENT_PAGE_QUERY_KEY, EVENT_VIEW_QUERY_KEY } from "../../../../features/shared/eventListingQueryKeys";

/* ==================================================
   MY EVENT QUERY PARAMS TESTS
   Tests current user event URL query params synchronization

   Handles:
   - current user view parsing
   - current user filter parsing
   - URLSearchParams building
================================================== */

const views = [
    { key: "created" },
    { key: "createdHistory" },
    { key: "joined" },
    { key: "joinedHistory" }
];

describe("myEventQueryParams", () => {

    /* =============================
       VIEW PARSING
    ============================= */

    it("should return view from URL when valid", () => {
        const searchParams = new URLSearchParams(
            `${EVENT_VIEW_QUERY_KEY}=joined`
        );

        expect(getInitialMyEventViewFromUrl(searchParams, views)).toBe(
            "joined"
        );
    });

    it("should return fallback view when URL view is invalid", () => {
        const searchParams = new URLSearchParams(
            `${EVENT_VIEW_QUERY_KEY}=invalid`
        );

        expect(getInitialMyEventViewFromUrl(searchParams, views)).toBe(
            "created"
        );
    });

    it("should return fallback view when URL view is missing", () => {
        const searchParams = new URLSearchParams();

        expect(getInitialMyEventViewFromUrl(searchParams, views)).toBe(
            "created"
        );
    });

    /* =============================
       FILTER PARSING
    ============================= */

    it("should return current user filters from URL", () => {
        const searchParams = new URLSearchParams(
            "search=music&creator=John%20Doe&type=Meetup&mode=online&status=upcoming&sortBy=title&order=desc"
        );

        expect(getInitialMyEventFiltersFromUrl(searchParams)).toMatchObject({
            search: "music",
            creator: "John Doe",
            type: "Meetup",
            mode: "online",
            status: "upcoming",
            sortBy: "title",
            order: "desc"
        });
    });

    it("should keep default values for missing filters", () => {
        const searchParams = new URLSearchParams("creator=John%20Doe");

        expect(getInitialMyEventFiltersFromUrl(searchParams)).toMatchObject({
            search: "",
            creator: "John Doe",
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
       PARAMS BUILDING
    ============================= */

    it("should build search params from filters, page and view", () => {
        const params = buildMyEventSearchParams({
            filters: {
                search: "music",
                creator: "John Doe",
                type: "",
                theme: "",
                mode: "online",
                location: "",
                status: "upcoming",
                date: "",
                startDate: "",
                endDate: "",
                sortBy: "title",
                order: "desc"
            },
            page: 2,
            view: "joined"
        });

        expect(params.get(EVENT_VIEW_QUERY_KEY)).toBe("joined");
        expect(params.get(EVENT_PAGE_QUERY_KEY)).toBe("2");
        expect(params.get("search")).toBe("music");
        expect(params.get("creator")).toBe("John Doe");
        expect(params.get("mode")).toBe("online");
        expect(params.get("status")).toBe("upcoming");
        expect(params.get("sortBy")).toBe("title");
        expect(params.get("order")).toBe("desc");
        expect(params.has("type")).toBe(false);
    });

    it("should not include fallback view or first page in URL params", () => {
        const params = buildMyEventSearchParams({
            filters: {
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
            },
            page: 1,
            view: "created"
        });

        expect(params.has(EVENT_VIEW_QUERY_KEY)).toBe(false);
        expect(params.has(EVENT_PAGE_QUERY_KEY)).toBe(false);
    });
});
