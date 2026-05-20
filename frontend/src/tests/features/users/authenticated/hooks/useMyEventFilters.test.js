import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import useMyEventFilters from "../../../../../features/users/authenticated/hooks/useMyEventFilters";

import { createMyEventFilters } from "../../../../factories/users/authenticated/myEventFiltersFactory";

import { createHookCallbacks } from "../../../../helpers/hooks/createHookProps";

/* ==================================================
   USE MY EVENT FILTERS TESTS
   Tests current user event filter state and handlers

   Handles:
   - default filter state
   - filter panel visibility
   - filter updates
   - filter submission and reset
   - sorting
   - quick filters
   - filter helper exposure

   Notes:
   - uses reusable current user event filter factories
   - uses reusable hook callback helpers
================================================== */

describe("useMyEventFilters", () => {
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

    const setupHook = (activeView = "created") => {
        return renderHook(() =>
            useMyEventFilters({
                activeView,
                loadData: hookProps.loadData,
                resetPage: hookProps.resetPage
            })
        );
    };

    /* =============================
       INITIAL STATE
    ============================= */

    it("should initialize with default filters and hidden filter panel", () => {
        const { result } = setupHook();

        expect(result.current.filterState.filters).toEqual(createMyEventFilters());
        expect(result.current.filterState.showFilters).toBe(false);
    });

    it("should expose filter helpers", () => {
        const { result } = setupHook();

        expect(result.current.filterHelpers.sortLabels).toBeDefined();
        expect(result.current.filterHelpers.isCurrentWeekendFilterActive).toEqual(expect.any(Function));
    });

    /* =============================
       FILTER CHANGES
    ============================= */

    it("should update filter value on input change", () => {
        const { result } = setupHook();

        act(() => {
            result.current.filterActions.handleFilterChange({
                target: {
                    name: "search",
                    value: "music"
                }
            });
        });

        expect(result.current.filterState.filters.search).toBe("music");
    });

    it("should apply filters and reload first page", async () => {
        const { result } = setupHook("joined");

        await act(async () => {
            await result.current.filterActions.handleFilterSubmit({
                preventDefault: vi.fn()
            });
        });

        expect(hookProps.resetPage).toHaveBeenCalled();

        expect(hookProps.loadData).toHaveBeenCalledWith(
            expect.objectContaining({
                sortBy: "startDateTime",
                order: "asc"
            }),
            1,
            "joined"
        );
    });

    it("should reset filters and reload first page", async () => {
        const { result } = setupHook();

        await act(async () => {
            await result.current.filterActions.handleResetFilters();
        });

        expect(result.current.filterState.filters).toEqual(createMyEventFilters());
        expect(hookProps.resetPage).toHaveBeenCalled();

        expect(hookProps.loadData).toHaveBeenCalledWith(
            expect.objectContaining({
                order: "asc",
                view: ""
            }),
            1,
            "created"
        );
    });

    /* =============================
       SORTING
    ============================= */

    it("should update sort values", () => {
        const { result } = setupHook();

        act(() => {
            result.current.filterActions.handleSortChange({
                target: {
                    value: "title-desc"
                }
            });
        });

        expect(result.current.filterState.filters.sortBy).toBe("title");
        expect(result.current.filterState.filters.order).toBe("desc");
    });

    /* =============================
       QUICK FILTERS
    ============================= */

    it("should toggle today quick filter", async () => {
        const { result } = setupHook();

        await act(async () => {
            await result.current.filterActions.handleTodayFilter();
        });

        expect(result.current.filterState.filters.date).toBe("2026-04-24");
        expect(result.current.filterState.filters.startDate).toBe("");
        expect(result.current.filterState.filters.endDate).toBe("");

        expect(hookProps.resetPage).toHaveBeenCalled();

        expect(hookProps.loadData).toHaveBeenCalledWith(
            expect.objectContaining({
                date: "2026-04-24"
            }),
            1,
            "created"
        );
    });

    it("should toggle weekend quick filter", async () => {
        const { result } = setupHook();

        await act(async () => {
            await result.current.filterActions.handleWeekendFilter();
        });

        expect(result.current.filterState.filters.date).toBe("");
        expect(result.current.filterState.filters.startDate).toBe("2026-04-25");
        expect(result.current.filterState.filters.endDate).toBe("2026-04-26");

        expect(hookProps.resetPage).toHaveBeenCalled();

        expect(hookProps.loadData).toHaveBeenCalledWith(
            expect.objectContaining({
                startDate: "2026-04-25",
                endDate: "2026-04-26"
            }),
            1,
            "created"
        );
    });
});
