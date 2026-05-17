import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import usePublicEventFilters from "../../../../../features/users/public/hooks/usePublicUserEventFilters";

import { createPublicUserEventFilters } from "../../../../factories/users/public/publicUserEventFiltersFactory";

import { createHookCallbacks } from "../../../../helpers/hooks/createHookProps";

/* ==================================================
   USE PUBLIC USER EVENT FILTERS TESTS
   Tests public user event filter state and handlers

   Handles:
   - filter form state
   - sorting
   - quick filters
   - filter submission/reset

   Notes:
   - uses reusable public user event filter factories
   - uses reusable hook callback helpers
================================================== */

describe("usePublicEventFilters", () => {
    let hookProps;

    beforeEach(() => {
        vi.useFakeTimers();

        vi.setSystemTime(
            new Date("2026-04-24T12:00:00")
        );

        hookProps = createHookCallbacks();
    });

    afterEach(() => {
        vi.useRealTimers();

        vi.clearAllMocks();
    });

    /* =============================
       TEST HELPERS
    ============================= */

    // Render public user event filters hook
    const setupHook = (activeView = "created") => {
        return renderHook(() =>
            usePublicEventFilters({
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

        expect(result.current.filters).toEqual(createPublicUserEventFilters());

        expect(result.current.showFilters).toBe(false);
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

    it("should apply filters and reload first page", async () => {
        const { result } = setupHook("joined");

        await act(async () => {
            await result.current.handleFilterSubmit({
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
            await result.current.handleResetFilters();
        });

        expect(result.current.filters).toEqual(createPublicUserEventFilters());

        expect(hookProps.resetPage).toHaveBeenCalled();

        expect(hookProps.loadData).toHaveBeenCalledWith(
            expect.objectContaining({
                order: "asc"
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
            result.current.handleSortChange({
                target: {
                    value: "title-desc"
                }
            });
        });

        expect(result.current.filters.sortBy).toBe("title");
        expect(result.current.filters.order).toBe("desc");
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
            "created"
        );
    });

    it("should toggle weekend quick filter", async () => {
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
            "created"
        );
    });
});
