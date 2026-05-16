import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import useEventFilters from "../../../../features/events/hooks/useEventFilters";

import { EVENT_STATUS } from "../../../../features/shared/eventStatus";

/* ==================================================
   USE EVENT FILTERS TESTS
   Tests public event filter state and handlers

   Handles:
   - default filter state
   - filter form updates
   - filter panel visibility
   - filter submission and reset
   - sort changes
   - today and weekend quick filters
   - active view forwarding
================================================== */

describe("useEventFilters", () => {
    let loadData;
    let resetPage;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-04-24T12:00:00")); // Friday

        loadData = vi.fn();
        resetPage = vi.fn();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    /* =============================
       TEST HELPERS
    ============================= */

    const setupHook = (
        activeView = "all",
        customInitialFilters = null
    ) => {
        return renderHook(() =>
            useEventFilters({
                activeView,
                loadData,
                resetPage,
                ...(customInitialFilters && {
                    initialFilters: customInitialFilters
                })
            })
        );
    };

    /* =============================
       INITIAL STATE
    ============================= */

    it("should initialize with default filters and hidden filter panel", () => {
        const { result } = setupHook();

        expect(result.current.filters).toEqual({
            search: "",
            creator: "",
            creatorId: "",
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
        });

        expect(result.current.showFilters).toBe(false);
    });

    it("should initialize with provided initial filters", () => {
        const { result } = setupHook(EVENT_STATUS.UPCOMING, {
            search: "music",
            creator: "John Doe",
            creatorId: "",
            type: "",
            theme: "",
            mode: "",
            location: "",
            status: "",
            date: "",
            startDate: "",
            endDate: "",
            sortBy: "title",
            order: "desc"
        });

        expect(result.current.filters).toMatchObject({
            search: "music",
            creator: "John Doe",
            sortBy: "title",
            order: "desc"
        });
    });

    /* =============================
       FILTER CHANGES
    ============================= */

    it("should update filter value on input change", () => {
        const { result } = setupHook();

        act(() => {
            result.current.handleFilterChange({
                target: {
                    name: "search",
                    value: "music"
                }
            });
        });

        expect(result.current.filters.search).toBe("music");
    });

    it("should toggle filter panel visibility", () => {
        const { result } = setupHook();

        act(() => {
            result.current.setShowFilters(true);
        });

        expect(result.current.showFilters).toBe(true);
    });

    it("should apply filters and reload first page on submit", async () => {
        const { result } = setupHook();

        act(() => {
            result.current.handleFilterChange({
                target: {
                    name: "search",
                    value: "tech"
                }
            });
        });

        await act(async () => {
            await result.current.handleFilterSubmit({
                preventDefault: vi.fn()
            });
        });

        expect(resetPage).toHaveBeenCalled();

        expect(loadData).toHaveBeenCalledWith(
            expect.objectContaining({
                search: "tech",
                sortBy: "startDateTime",
                order: "asc"
            }),
            1,
            "all"
        );
    });

    it("should reset filters and reload first page", async () => {
        const { result } = setupHook();

        act(() => {
            result.current.handleFilterChange({
                target: {
                    name: "search",
                    value: "music"
                }
            });
        });

        await act(async () => {
            await result.current.handleResetFilters();
        });

        expect(result.current.filters.search).toBe("");
        expect(resetPage).toHaveBeenCalled();

        expect(loadData).toHaveBeenCalledWith(
            expect.objectContaining({
                search: "",
                sortBy: "",
                order: "asc"
            }),
            1,
            "all"
        );
    });

    /* =============================
       SORTING
    ============================= */

    it("should update sort values from selected sort option", () => {
        const { result } = setupHook();

        act(() => {
            result.current.handleSortChange({
                target: {
                    value: "title-desc"
                }
            });
        });

        expect(result.current.filters.sortBy).toBe("title");
        expect(result.current.filters.order).toBe("desc");
    });

    it("should return past-view specific sort labels", () => {
        const { result } = setupHook(EVENT_STATUS.PAST);

        expect(result.current.sortLabels["startDateTime-asc"]).toBe(
            "Oldest first"
        );

        expect(result.current.sortLabels["startDateTime-desc"]).toBe(
            "Most recent"
        );
    });

    /* =============================
       QUICK FILTERS
    ============================= */

    it("should toggle today quick filter", async () => {
        const { result } = setupHook();

        await act(async () => {
            await result.current.handleTodayFilter();
        });

        expect(result.current.filters.date).toBe("2026-04-24");
        expect(result.current.filters.startDate).toBe("");
        expect(result.current.filters.endDate).toBe("");
        expect(resetPage).toHaveBeenCalled();

        expect(loadData).toHaveBeenCalledWith(
            expect.objectContaining({
                date: "2026-04-24"
            }),
            1,
            "all"
        );

        await act(async () => {
            await result.current.handleTodayFilter();
        });

        expect(result.current.filters.date).toBe("");
    });

    it("should toggle current weekend quick filter", async () => {
        const { result } = setupHook();

        await act(async () => {
            await result.current.handleWeekendFilter();
        });

        expect(result.current.filters.date).toBe("");
        expect(result.current.filters.startDate).toBe("2026-04-25");
        expect(result.current.filters.endDate).toBe("2026-04-26");
        expect(resetPage).toHaveBeenCalled();

        expect(loadData).toHaveBeenCalledWith(
            expect.objectContaining({
                startDate: "2026-04-25",
                endDate: "2026-04-26"
            }),
            1,
            "all"
        );

        await act(async () => {
            await result.current.handleWeekendFilter();
        });

        expect(result.current.filters.startDate).toBe("");
        expect(result.current.filters.endDate).toBe("");
    });

    /* =============================
       ACTIVE VIEW
    ============================= */

    it("should pass activeView to loadData", async () => {
        const { result } = setupHook(EVENT_STATUS.UPCOMING);

        await act(async () => {
            await result.current.handleFilterSubmit({
                preventDefault: vi.fn()
            });
        });

        expect(loadData).toHaveBeenCalledWith(
            expect.any(Object),
            1,
            EVENT_STATUS.UPCOMING
        );
    });
});
