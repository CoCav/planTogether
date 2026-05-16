import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import useMyEventFilters from "../../../../../features/users/authenticated/hooks/useMyEventFilters";

/* ==================================================
   USE MY EVENT FILTERS TESTS
   Tests current user event filter state and handlers

   Handles:
   - default filter state
   - filter updates
   - filter submission and reset
   - sorting
   - quick filters
================================================== */

describe("useMyEventFilters", () => {
    let loadData;
    let resetPage;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-04-24T12:00:00"));

        loadData = vi.fn();
        resetPage = vi.fn();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    const setupHook = (activeView = "created") => {
        return renderHook(() =>
            useMyEventFilters({
                activeView,
                loadData,
                resetPage
            })
        );
    };

    it("should initialize with default filters and hidden filter panel", () => {
        const { result } = setupHook();

        expect(result.current.filters).toMatchObject({
            search: "",
            creator: "",
            status: "",
            sortBy: "",
            order: "asc",
            view: ""
        });

        expect(result.current.showFilters).toBe(false);
    });

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

        expect(resetPage).toHaveBeenCalled();

        expect(loadData).toHaveBeenCalledWith(
            expect.objectContaining({
                sortBy: "startDateTime",
                order: "asc"
            }),
            1,
            "joined"
        );
    });

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

    it("should reset filters and reload first page", async () => {
        const { result } = setupHook();

        await act(async () => {
            await result.current.handleResetFilters();
        });

        expect(result.current.filters.search).toBe("");
        expect(resetPage).toHaveBeenCalled();
        expect(loadData).toHaveBeenCalledWith(
            expect.objectContaining({
                order: "asc",
                view: ""
            }),
            1,
            "created"
        );
    });

    it("should toggle today quick filter", async () => {
        const { result } = setupHook();

        await act(async () => {
            await result.current.handleTodayFilter();
        });

        expect(result.current.filters.date).toBe("2026-04-24");
        expect(result.current.filters.startDate).toBe("");
        expect(result.current.filters.endDate).toBe("");
    });

    it("should toggle weekend quick filter", async () => {
        const { result } = setupHook();

        await act(async () => {
            await result.current.handleWeekendFilter();
        });

        expect(result.current.filters.date).toBe("");
        expect(result.current.filters.startDate).toBe("2026-04-25");
        expect(result.current.filters.endDate).toBe("2026-04-26");
    });
});
