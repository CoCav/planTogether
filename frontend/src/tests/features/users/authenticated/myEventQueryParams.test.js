import { describe, expect, it } from "vitest";

import {
    buildMyEventSearchParams,
    getInitialMyEventFiltersFromUrl,
    getInitialMyEventViewFromUrl
} from "../../../../features/users/authenticated/myEventQueryParams";

import { EVENT_PAGE_QUERY_KEY, EVENT_VIEW_QUERY_KEY } from "../../../../features/shared/eventListingQueryKeys";

import { EVENT_STATUS } from "../../../../features/shared/eventStatus";

import { createMyEventFilters } from "../../../factories/users/authenticated/myEventFiltersFactory";

import {
    createCreatedEventsView,
    createCreatedHistoryView,
    createJoinedEventsView,
    createJoinedHistoryView
} from "../../../factories/users/authenticated/myEventViewFactory";

/* ==================================================
   MY EVENT QUERY PARAMS TESTS
   Tests current user event URL query params synchronization

   Handles:
   - current user view parsing
   - custom fallback view
   - current user filter parsing
   - URLSearchParams building
   - empty filter exclusion

   Notes:
   - uses reusable current user event filter factories
   - uses reusable current user event view factories
================================================== */

const views = [
    createCreatedEventsView(),
    createCreatedHistoryView(),
    createJoinedEventsView(),
    createJoinedHistoryView()
];

describe("myEventQueryParams", () => {

    /* =============================
       VIEW PARSING
    ============================= */

    it("should return view from URL when valid", () => {
        const searchParams = new URLSearchParams(
            `${EVENT_VIEW_QUERY_KEY}=joined`
        );

        expect(
            getInitialMyEventViewFromUrl(searchParams, views)
        ).toBe("joined");
    });

    it("should return fallback view when URL view is invalid", () => {
        const searchParams = new URLSearchParams(
            `${EVENT_VIEW_QUERY_KEY}=invalid`
        );

        expect(
            getInitialMyEventViewFromUrl(searchParams, views)
        ).toBe("created");
    });

    it("should return fallback view when URL view is missing", () => {
        const searchParams = new URLSearchParams();

        expect(
            getInitialMyEventViewFromUrl(searchParams, views)
        ).toBe("created");
    });

    it("should support a custom fallback view", () => {
        const searchParams = new URLSearchParams(
            `${EVENT_VIEW_QUERY_KEY}=invalid`
        );

        expect(
            getInitialMyEventViewFromUrl(
                searchParams,
                views,
                "joined"
            )
        ).toBe("joined");
    });

    /* =============================
       FILTER PARSING
    ============================= */

    it("should return current user filters from URL", () => {
        const searchParams = new URLSearchParams(
            "search=music&creator=John%20Doe&type=Meetup&mode=online&status=upcoming&sortBy=title&order=desc"
        );

        expect(
            getInitialMyEventFiltersFromUrl(searchParams)
        ).toMatchObject(
            createMyEventFilters({
                search: "music",
                creator: "John Doe",
                type: "Meetup",
                mode: "online",
                status: EVENT_STATUS.UPCOMING,
                sortBy: "title",
                order: "desc"
            })
        );
    });

    it("should keep default values for missing filters", () => {
        const searchParams = new URLSearchParams(
            "creator=John%20Doe"
        );

        expect(
            getInitialMyEventFiltersFromUrl(searchParams)
        ).toMatchObject(
            createMyEventFilters({
                creator: "John Doe"
            })
        );
    });

    /* =============================
       PARAMS BUILDING
    ============================= */

    it("should build search params from filters, page and view", () => {
        const params = buildMyEventSearchParams({
            filters: createMyEventFilters({
                search: "music",
                creator: "John Doe",
                mode: "online",
                status: EVENT_STATUS.UPCOMING,
                sortBy: "title",
                order: "desc"
            }),
            page: 2,
            view: "joined"
        });

        expect(params.get(EVENT_VIEW_QUERY_KEY)).toBe("joined");

        expect(params.get(EVENT_PAGE_QUERY_KEY)).toBe("2");

        expect(params.get("search")).toBe("music");
        expect(params.get("creator")).toBe("John Doe");

        expect(params.get("mode")).toBe("online");
        expect(params.get("status")).toBe(EVENT_STATUS.UPCOMING);

        expect(params.get("sortBy")).toBe("title");
        expect(params.get("order")).toBe("desc");

        expect(params.has("type")).toBe(false);
    });

    it("should not include fallback view or first page in URL params", () => {
        const params = buildMyEventSearchParams({
            filters: createMyEventFilters(),
            page: 1,
            view: "created"
        });

        expect(params.has(EVENT_VIEW_QUERY_KEY)).toBe(false);
        expect(params.has(EVENT_PAGE_QUERY_KEY)).toBe(false);
    });

    it("should not include empty filter values in URL params", () => {
        const params = buildMyEventSearchParams({
            filters: createMyEventFilters({
                search: "",
                creator: "John Doe",
                type: "",
                mode: ""
            }),
            page: 1,
            view: "created"
        });

        expect(params.get("creator")).toBe("John Doe");

        expect(params.has("search")).toBe(false);
        expect(params.has("type")).toBe(false);
        expect(params.has("mode")).toBe(false);
    });
});
