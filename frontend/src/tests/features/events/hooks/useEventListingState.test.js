import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import useEventListingState from "../../../../features/events/hooks/useEventListingState";

import { EVENT_STATUS } from "../../../../features/shared/eventStatus";

/* ==================================================
   USE EVENT LISTING STATE TESTS
   Tests public event listing UI and URL-related state

   Handles:
   - initial URL-derived view and pagination
   - feedback state
   - loading state
   - pagination reset
   - URL synchronization
   - view-based filter cleanup

   Notes:
   - uses URLSearchParams to simulate router query params
   - focuses on local listing state, not API fetching
================================================== */

describe("useEventListingState", () => {

    /* =============================
       TEST HELPERS
    ============================= */

    const renderUseEventListingState = (query = "") => {
        const searchParams = new URLSearchParams(query);
        const setSearchParams = vi.fn();

        const hook = renderHook(() =>
            useEventListingState({
                searchParams,
                setSearchParams
            })
        );

        return {
            ...hook,
            setSearchParams
        };
    };


    /* =============================
       INITIAL STATE
    ============================= */

    it("initializes feedback and loading state", () => {
        const { result } = renderUseEventListingState();

        expect(result.current.feedback.message).toBe("");
        expect(result.current.feedback.error).toBe("");

        expect(result.current.loadingState.initialLoading).toBe(true);
        expect(result.current.loadingState.isLoading).toBe(false);
    });

    it("initializes view and pagination from URL params", () => {
        const { result } = renderUseEventListingState("view=past&page=3")

        expect(result.current.view.initialView).toBe(EVENT_STATUS.PAST);
        expect(result.current.view.activeView).toBe(EVENT_STATUS.PAST);

        expect(result.current.paginationState.initialPage).toBe(3);
        expect(result.current.paginationState.pagination.page).toBe(3);
    });

    it("uses fallback view when URL view is invalid", () => {
        const { result } = renderUseEventListingState("view=unknown&page=2");

        expect(result.current.view.initialView).toBe("all");
        expect(result.current.view.activeView).toBe("all");

        expect(result.current.paginationState.initialPage).toBe(2);
        expect(result.current.paginationState.pagination.page).toBe(2);
    });

    it("supports a custom fallback view", () => {
        const searchParams = new URLSearchParams("view=unknown");
        const setSearchParams = vi.fn();

        const { result } = renderHook(() =>
            useEventListingState({
                searchParams,
                setSearchParams,
                fallbackView: EVENT_STATUS.UPCOMING
            })
        );

        expect(result.current.view.initialView).toBe(EVENT_STATUS.UPCOMING);
        expect(result.current.view.activeView).toBe(EVENT_STATUS.UPCOMING);
    });

    /* =============================
       URL SYNCHRONIZATION
    ============================= */

    it("syncs filters, page and view to URL search params", () => {
        const { result, setSearchParams } = renderUseEventListingState();

        act(() => {
            result.current.syncUrl(
                {
                    search: "react",
                    type: "workshop"
                },
                2,
                EVENT_STATUS.UPCOMING
            );
        });

        expect(setSearchParams).toHaveBeenCalledTimes(1);

        const nextParams = setSearchParams.mock.calls[0][0];

        expect(nextParams.get("search")).toBe("react");
        expect(nextParams.get("type")).toBe("workshop");
        expect(nextParams.get("page")).toBe("2");
        expect(nextParams.get("view")).toBe(EVENT_STATUS.UPCOMING);
    });


    /* =============================
       PAGINATION
    ============================= */

    it("resets pagination to the first page", () => {
        const { result } = renderUseEventListingState("page=4");

        expect(result.current.paginationState.pagination.page).toBe(4);

        act(() => {
            result.current.resetPage();
        });

        expect(result.current.paginationState.pagination.page).toBe(1);
    });


    /* =============================
       VIEW FILTER HELPERS
    ============================= */

    it("keeps filters unchanged when the target view does not clear date filters", () => {
        const { result } = renderUseEventListingState();

        const filters = {
            search: "react",
            date: "2026-05-18",
            startDate: "2026-05-18",
            endDate: "2026-05-19"
        };

        const nextFilters = result.current.view.getFiltersForView(filters, "all");

        expect(nextFilters).toEqual(filters);
    });

    it("clears date filters when the target view requires date reset", () => {
        const { result } = renderUseEventListingState();

        const filters = {
            search: "react",
            date: "2026-05-18",
            startDate: "2026-05-18",
            endDate: "2026-05-19"
        };

        const nextFilters = result.current.view.getFiltersForView(filters, EVENT_STATUS.PAST);

        expect(nextFilters).toEqual({
            search: "react",
            date: "",
            startDate: "",
            endDate: ""
        });
    });
});
