import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useEventFilters from "../../../hooks/events/useEventFilters";

/* ==================================================
   USE EVENT FILTERS TESTS
   Tests shared event filter state and handlers
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

    const setupHook = (activeView = "all") => renderHook(() => useEventFilters({ activeView, loadData, resetPage }));

    it("initializes with default filters and hidden filter panel", () => {
        const { result } = setupHook();

        expect(result.current.filters).toEqual({
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

        expect(result.current.showFilters).toBe(false);
    });

    it("updates filter value on input change", () => {
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

    it("toggles filter panel visibility", () => {
        const { result } = setupHook();

        act(() => {
            result.current.setShowFilters(true);
        });

        expect(result.current.showFilters).toBe(true);
    });

    it("applies filters and reloads first page on submit", async () => {
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

    it("updates sort values from selected sort option", () => {
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

    it("resets filters and reloads first page", async () => {
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

    it("toggles today quick filter", async () => {
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
                search: "",
                sortBy: "",
                order: "asc"
            }),
            1,
            "all"
        );

        await act(async () => {
            await result.current.handleTodayFilter();
        });

        expect(result.current.filters.date).toBe("");
    });

    it("toggles current weekend quick filter", async () => {
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
                search: "",
                sortBy: "",
                order: "asc"
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

    it("returns archive-specific sort labels", () => {
        const { result } = setupHook("archives");

        expect(result.current.sortLabels["startDateTime-asc"]).toBe("Oldest first");
        expect(result.current.sortLabels["startDateTime-desc"]).toBe("Most recent");
    });

    it("passes activeView to loadData", async () => {
        const { result } = setupHook("upcoming");

        await act(async () => {
            await result.current.handleFilterSubmit({
                preventDefault: vi.fn()
            });
        });

        expect(loadData).toHaveBeenCalledWith(
            expect.any(Object),
            1,
            "upcoming"
        );
    });
});
