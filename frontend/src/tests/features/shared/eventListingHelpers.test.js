import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    EVENT_SORT_MAP,
    getCurrentWeekendDateRange,
    getSortLabels,
    getTodayEventFilters,
    getWeekendEventFilters,
    isCurrentWeekendFilterActive
} from "../../../features/shared/eventListingHelpers";

import { EVENT_STATUS } from "../../../features/shared/constants/eventStatus";

/* ==================================================
   EVENT LISTING HELPERS TESTS
   Tests shared event listing helper utilities

   Handles:
   - sort option mapping
   - sort labels by view
   - today quick filters
   - weekend quick filters
   - current weekend detection
================================================== */

describe("eventListingHelpers", () => {

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-04-24T12:00:00")); // Friday
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    /* =============================
       SORT OPTIONS
    ============================= */

    it("should map sort options to backend params", () => {
        expect(EVENT_SORT_MAP["startDateTime-asc"]).toEqual({
            sortBy: "startDateTime",
            order: "asc"
        });

        expect(EVENT_SORT_MAP["title-desc"]).toEqual({
            sortBy: "title",
            order: "desc"
        });
    });

    it("should return default sort labels for non-past views", () => {
        const labels = getSortLabels("all");

        expect(labels["startDateTime-asc"]).toBe("Soonest first");
        expect(labels["startDateTime-desc"]).toBe("Farthest first");
        expect(labels["title-asc"]).toBe("Title A-Z");
        expect(labels["title-desc"]).toBe("Title Z-A");
    });

    it("should return past-view specific sort labels", () => {
        const labels = getSortLabels(EVENT_STATUS.PAST);

        expect(labels["startDateTime-asc"]).toBe("Oldest first");
        expect(labels["startDateTime-desc"]).toBe("Most recent");
    });

    /* =============================
       TODAY FILTERS
    ============================= */

    it("should build today filters and reset date range", () => {
        const filters = getTodayEventFilters({
            search: "music",
            startDate: "2026-05-01",
            endDate: "2026-05-02"
        });

        expect(filters).toMatchObject({
            search: "music",
            date: "2026-04-24",
            startDate: "",
            endDate: ""
        });
    });

    /* =============================
       WEEKEND FILTERS
    ============================= */

    it("should return current weekend date range", () => {
        expect(getCurrentWeekendDateRange()).toEqual({
            startDate: "2026-04-25",
            endDate: "2026-04-26"
        });
    });

    it("should detect when current weekend filter is active", () => {
        expect(
            isCurrentWeekendFilterActive({
                startDate: "2026-04-25",
                endDate: "2026-04-26"
            })
        ).toBe(true);
    });

    it("should not detect a different weekend as current weekend", () => {
        expect(
            isCurrentWeekendFilterActive({
                startDate: "2026-05-23",
                endDate: "2026-05-24"
            })
        ).toBe(false);
    });

    it("should build weekend filters and reset single date", () => {
        const filters = getWeekendEventFilters({
            date: "2026-04-24",
            search: "tech"
        });

        expect(filters).toMatchObject({
            search: "tech",
            date: "",
            startDate: "2026-04-25",
            endDate: "2026-04-26"
        });
    });
});
