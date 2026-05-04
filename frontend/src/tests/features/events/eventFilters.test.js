import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EVENT_SORT_MAP, getCurrentWeekendDateRange, getDefaultEventFilters, getSortLabels, getTodayEventFilters, getWeekendEventFilters, isCurrentWeekendFilterActive } from "../../../features/events/eventFilters";

/* ==================================================
   EVENT FILTERS TESTS
   Tests filter defaults, sort options and quick filters
================================================== */

describe("eventFilters", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-04-24T12:00:00")); // Friday
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("should return default event filters", () => {
        expect(getDefaultEventFilters()).toEqual({
            search: "",
            creator: "",
            type: "",
            theme: "",
            mode: "",
            location: "",
            date: "",
            startDate: "",
            endDate: "",
            sortBy: "",
            order: "asc"
        });
    });

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

    it("should return default sort labels for non-archive views", () => {
        const labels = getSortLabels("all");

        expect(labels["startDateTime-asc"]).toBe("Soonest first");
        expect(labels["startDateTime-desc"]).toBe("Farthest first");
        expect(labels["title-asc"]).toBe("Title A-Z");
        expect(labels["title-desc"]).toBe("Title Z-A");
    });

    it("should return archive-specific sort labels", () => {
        const labels = getSortLabels("archives");

        expect(labels["startDateTime-asc"]).toBe("Oldest first");
        expect(labels["startDateTime-desc"]).toBe("Most recent");
    });

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
