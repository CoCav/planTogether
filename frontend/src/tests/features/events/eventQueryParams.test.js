import { describe, expect, it } from "vitest";

import {
    PUBLIC_EVENT_FILTER_QUERY_KEYS,
    buildEventSearchParams,
    getInitialEventFiltersFromUrl,
    getInitialViewFromUrl
} from "../../../features/events/eventQueryParams";

import { getInitialPageFromUrl } from "../../../features/shared/eventListingQueryParams";

import { EVENT_PAGE_QUERY_KEY, EVENT_VIEW_QUERY_KEY } from "../../../features/shared/eventListingQueryKeys";

import { EVENT_STATUS } from "../../../features/shared/constants/eventStatus";

import { createEventFilters } from "../../factories/events/eventFiltersFactory";

import {
    createAllEventsView,
    createPastEventsView,
    createUpcomingEventsView
} from "../../factories/events/eventViewFactory";

/* ==================================================
   EVENT QUERY PARAMS TESTS
   Tests public event URL query params synchronization

   Handles:
   - public event query keys
   - view parsing
   - shared page parsing
   - filter parsing
   - URLSearchParams building

   Notes:
   - uses reusable event filter factories
   - uses reusable event view factories
   - uses shared page query param helpers
================================================== */

const views = [
    createAllEventsView(),
    createUpcomingEventsView(),
    createPastEventsView()
];

describe("eventQueryParams", () => {

    /* =============================
       QUERY KEYS
    ============================= */

    it("should expose supported public event filter query keys", () => {
        expect(PUBLIC_EVENT_FILTER_QUERY_KEYS).toEqual([
            "search",
            "creator",
            "creatorId",
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

    /* =============================
       VIEW PARSING
    ============================= */

    it("should return view from URL when valid", () => {
        const searchParams = new URLSearchParams(
            `${EVENT_VIEW_QUERY_KEY}=${EVENT_STATUS.UPCOMING}`
        );

        expect(getInitialViewFromUrl(searchParams, views)).toBe(EVENT_STATUS.UPCOMING);
    });

    it("should return fallback view when URL view is invalid", () => {
        const searchParams = new URLSearchParams(
            `${EVENT_VIEW_QUERY_KEY}=invalid`
        );

        expect(getInitialViewFromUrl(searchParams, views)).toBe("all");
    });

    it("should return fallback view when URL view is missing", () => {
        const searchParams = new URLSearchParams();

        expect(getInitialViewFromUrl(searchParams, views)).toBe("all");
    });

    /* =============================
       PAGE PARSING
    ============================= */

    it("should return page from URL when valid", () => {
        const searchParams = new URLSearchParams(
            `${EVENT_PAGE_QUERY_KEY}=3`
        );

        expect(getInitialPageFromUrl(searchParams)).toBe(3);
    });

    it("should return page 1 when URL page is invalid", () => {
        expect(getInitialPageFromUrl(
            new URLSearchParams(
                `${EVENT_PAGE_QUERY_KEY}=abc`
            )
        )).toBe(1);

        expect(getInitialPageFromUrl(
            new URLSearchParams(
                `${EVENT_PAGE_QUERY_KEY}=0`
            )
        )).toBe(1);

        expect(getInitialPageFromUrl(
            new URLSearchParams(
                `${EVENT_PAGE_QUERY_KEY}=-2`
            )
        )).toBe(1);
    });

    /* =============================
       FILTER PARSING
    ============================= */

    it("should return filters from URL", () => {
        const searchParams = new URLSearchParams(
            "search=music&creator=John%20Doe&creatorId=2&type=Meetup&mode=online&status=upcoming&sortBy=title&order=desc"
        );

        expect(
            getInitialEventFiltersFromUrl(searchParams)
        ).toMatchObject(
            createEventFilters({
                search: "music",
                creator: "John Doe",
                creatorId: "2",
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
            getInitialEventFiltersFromUrl(searchParams)
        ).toMatchObject(
            createEventFilters({
                creator: "John Doe"
            })
        );
    });

    /* =============================
       PARAMS BUILDING
    ============================= */

    it("should build search params from filters, page and view", () => {
        const params = buildEventSearchParams({
            filters: createEventFilters({
                search: "music",
                creator: "John Doe",
                creatorId: "2",
                mode: "online",
                status: EVENT_STATUS.UPCOMING,
                sortBy: "title",
                order: "desc"
            }),
            page: 2,
            view: EVENT_STATUS.UPCOMING
        });

        expect(params.get(EVENT_VIEW_QUERY_KEY)).toBe(EVENT_STATUS.UPCOMING);

        expect(params.get(EVENT_PAGE_QUERY_KEY)).toBe("2");

        expect(params.get("search")).toBe("music");
        expect(params.get("creator")).toBe("John Doe");
        expect(params.get("creatorId")).toBe("2");

        expect(params.get("mode")).toBe("online");
        expect(params.get("status")).toBe(EVENT_STATUS.UPCOMING);

        expect(params.get("sortBy")).toBe("title");
        expect(params.get("order")).toBe("desc");

        expect(params.has("type")).toBe(false);
    });

    it("should not include fallback view or first page in URL params", () => {
        const params = buildEventSearchParams({
            filters: createEventFilters(),
            page: 1,
            view: "all"
        });

        expect(params.has(EVENT_VIEW_QUERY_KEY)).toBe(false);
        expect(params.has(EVENT_PAGE_QUERY_KEY)).toBe(false);
    });
});
