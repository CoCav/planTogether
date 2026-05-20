import { describe, expect, it } from "vitest";

import { getInitialPageFromUrl } from "../../../features/shared/eventListingQueryParams";

import { EVENT_PAGE_QUERY_KEY } from "../../../features/shared/eventListingQueryKeys";

/* ==================================================
   EVENT LISTING QUERY PARAMS TESTS
   Tests shared event listing URL query param helpers

   Handles:
   - valid page parsing
   - invalid page fallback
   - missing page fallback

   Notes:
   - shared by public events and current user events
================================================== */

describe("eventListingQueryParams", () => {

    /* =============================
       PAGE PARSING
    ============================= */

    it("should return page from URL when valid", () => {
        const searchParams = new URLSearchParams(
            `${EVENT_PAGE_QUERY_KEY}=3`
        );

        expect(getInitialPageFromUrl(searchParams)).toBe(3);
    });

    it("should return page 1 when URL page is decimal", () => {
        expect(getInitialPageFromUrl(
            new URLSearchParams(`${EVENT_PAGE_QUERY_KEY}=2.5`)
        )).toBe(1);
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

    it("should return page 1 when URL page is missing", () => {
        expect(getInitialPageFromUrl(
            new URLSearchParams()
        )).toBe(1);
    });
});
