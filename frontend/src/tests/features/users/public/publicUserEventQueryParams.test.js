import { describe, expect, it } from "vitest";

import {
    buildPublicUserEventSearchParams,
    getInitialPublicUserEventFiltersFromUrl,
    getInitialPublicUserEventPageFromUrl,
    getInitialPublicUserEventViewFromUrl
} from "../../../../features/users/public/publicUserEventQueryParams";

import { EVENT_PAGE_QUERY_KEY } from "../../../../features/shared/eventListingQueryKeys";

import { createPublicUserEventFilters } from "../../../factories/users/public/publicUserEventFiltersFactory";

/* ==================================================
   PUBLIC USER EVENT QUERY PARAMS TESTS
   Tests public user event URL query synchronization

   Handles:
   - view parsing
   - page parsing
   - filter parsing
   - URL param generation
   - fallback view omission

   Notes:
   - uses reusable public user event filter factories
================================================== */

describe("publicUserEventQueryParams", () => {

    /* =============================
       TEST DATA
    ============================= */

    const views = [
        { key: "created" },
        { key: "joined" }
    ];

    /* =============================
       VIEW PARSING
    ============================= */

    it("should return view from URL when valid", () => {
        const searchParams = new URLSearchParams("view=joined");

        expect(getInitialPublicUserEventViewFromUrl(searchParams, views)).toBe("joined");
    });

    it("should return fallback view when URL view is invalid", () => {
        const searchParams = new URLSearchParams("view=invalid");

        expect(getInitialPublicUserEventViewFromUrl(searchParams, views)).toBe("created");
    });

    it("should support custom fallback view", () => {
        const searchParams = new URLSearchParams("view=invalid");

        expect(getInitialPublicUserEventViewFromUrl(searchParams, views, "joined")).toBe("joined");
    });

    /* =============================
       PAGE PARSING
    ============================= */

    it("should return page from URL when valid", () => {
        const searchParams = new URLSearchParams(
            `${EVENT_PAGE_QUERY_KEY}=3`
        );

        expect(getInitialPublicUserEventPageFromUrl(searchParams)).toBe(3);
    });

    it("should return page 1 when URL page is invalid", () => {
        expect(getInitialPublicUserEventPageFromUrl(
            new URLSearchParams(`${EVENT_PAGE_QUERY_KEY}=abc`)
        )).toBe(1);

        expect(getInitialPublicUserEventPageFromUrl(
            new URLSearchParams(`${EVENT_PAGE_QUERY_KEY}=0`)
        )).toBe(1);

        expect(getInitialPublicUserEventPageFromUrl(
            new URLSearchParams(`${EVENT_PAGE_QUERY_KEY}=-2`)
        )).toBe(1);
    });

    /* =============================
       FILTER PARSING
    ============================= */

    it("should return filters from URL", () => {
        const searchParams = new URLSearchParams(
            "search=music&type=Meetup&mode=online&sortBy=title&order=desc"
        );

        expect(
            getInitialPublicUserEventFiltersFromUrl(searchParams)
        ).toMatchObject(
            createPublicUserEventFilters({
                search: "music",
                type: "Meetup",
                mode: "online",
                sortBy: "title",
                order: "desc"
            })
        );
    });

    it("should keep default values for missing filters", () => {
        const searchParams = new URLSearchParams(
            "theme=Tech"
        );

        expect(
            getInitialPublicUserEventFiltersFromUrl(searchParams)
        ).toMatchObject(
            createPublicUserEventFilters({
                theme: "Tech"
            })
        );
    });

    /* =============================
       PARAMS BUILDING
    ============================= */

    it("should build URL params from filters, page and view", () => {
        const params = buildPublicUserEventSearchParams({
            filters: createPublicUserEventFilters({
                search: "music",
                mode: "online",
                sortBy: "title",
                order: "desc"
            }),

            page: 2,
            view: "joined"
        });

        expect(params.get(EVENT_PAGE_QUERY_KEY)).toBe("2");
        expect(params.get("search")).toBe("music");
        expect(params.get("mode")).toBe("online");
        expect(params.get("sortBy")).toBe("title");
        expect(params.get("order")).toBe("desc");
        expect(params.get("view")).toBe("joined");

        expect(params.has("type")).toBe(false);
    });

    it("should not include first page in URL params", () => {
        const params = buildPublicUserEventSearchParams({
            filters: createPublicUserEventFilters(),
            page: 1
        });

        expect(params.has(EVENT_PAGE_QUERY_KEY)).toBe(false);
    });

    it("should not include fallback view in URL params", () => {
        const params = buildPublicUserEventSearchParams({
            filters: createPublicUserEventFilters(),
            page: 1,
            view: "created",
            fallbackView: "created"
        });

        expect(params.has("view")).toBe(false);
    });

    it("should omit fallback view when custom fallback view is used", () => {
        const params = buildPublicUserEventSearchParams({
            filters: createPublicUserEventFilters(),
            page: 1,
            view: "joined",
            fallbackView: "joined"
        });

        expect(params.has("view")).toBe(false);
    });
});
