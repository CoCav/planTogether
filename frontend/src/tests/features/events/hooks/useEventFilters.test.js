import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import useEventFilters from "../../../../features/events/hooks/useEventFilters";

import { EVENT_STATUS } from "../../../../features/shared/eventStatus";

import { createEventFilters } from "../../../factories/events/eventFiltersFactory";

import { createHookCallbacks } from "../../../helpers/hooks/createHookProps";

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

   Notes:
   - uses reusable event filter factories
   - uses reusable hook callback helpers
================================================== */

describe("useEventFilters", () => {
    let hookProps;

    beforeEach(() => {
        vi.useFakeTimers();

        vi.setSystemTime(new Date("2026-04-24T12:00:00"));

        hookProps = createHookCallbacks();
    });

    afterEach(() => {
        vi.useRealTimers();

        vi.clearAllMocks();
    });

    /* =============================
       TEST HELPERS
    ============================= */

    // Render public event filters hook
    const setupHook = ({
        activeView = "all",
        initialFilters
    } = {}) => {
        return renderHook(() =>
            useEventFilters({
                activeView,
                loadData: hookProps.loadData,
                resetPage: hookProps.resetPage,
                ...(initialFilters && {
                    initialFilters
                })
            })
        );
    };

    /* =============================
       INITIAL STATE
    ============================= */

    it("should initialize with default filters and hidden filter panel", () => {
        const { result } = setupHook();

        expect(result.current.filters).toEqual(createEventFilters());

        expect(result.current.showFilters).toBe(false);
    });

    it("should initialize with provided initial filters", () => {
        const initialFilters = createEventFilters({
            search: "music",
            creator: "John Doe",
            sortBy: "title",
            order: "desc"
        });

        const { result } = setupHook({
            activeView: EVENT_STATUS.UPCOMING,
            initialFilters
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

        expect(hookProps.resetPage).toHaveBeenCalled();

        expect(hookProps.loadData).toHaveBeenCalledWith(
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

        expect(hookProps.resetPage).toHaveBeenCalled();

        expect(hookProps.loadData).toHaveBeenCalledWith(
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
        const { result } = setupHook({
            activeView: EVENT_STATUS.PAST
        });

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

        expect(hookProps.resetPage).toHaveBeenCalled();

        expect(hookProps.loadData).toHaveBeenCalledWith(
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

        expect(hookProps.resetPage).toHaveBeenCalled();

        expect(hookProps.loadData).toHaveBeenCalledWith(
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
        const { result } = setupHook({
            activeView: EVENT_STATUS.UPCOMING
        });

        await act(async () => {
            await result.current.handleFilterSubmit({
                preventDefault: vi.fn()
            });
        });

        expect(hookProps.loadData).toHaveBeenCalledWith(expect.any(Object), 1, EVENT_STATUS.UPCOMING);
    });
});
