import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import useMyEventListingState from "../../../../../features/users/authenticated/hooks/useMyEventListingState";

/* ==================================================
   USE MY EVENT LISTING STATE TESTS
   Tests current user event listing UI and URL-related state

   Handles:
   - initial URL-derived view and pagination
   - custom fallback view
   - feedback state
   - loading state
   - pagination reset
   - URL synchronization
   - view-based filter cleanup

   Notes:
   - uses URLSearchParams to simulate router query params
   - focuses on local listing state, not API fetching
================================================== */

describe("useMyEventListingState", () => {

    /* =============================
       TEST HELPERS
    ============================= */

    const renderUseMyEventListingState = (query = "", options = {}) => {
        const searchParams = new URLSearchParams(query);
        const setSearchParams = vi.fn();

        const hook = renderHook(() =>
            useMyEventListingState({
                searchParams,
                setSearchParams,
                ...options
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
        const { result } = renderUseMyEventListingState();

        expect(result.current.feedback.message).toBe("");
        expect(result.current.feedback.error).toBe("");

        expect(result.current.loadingState.initialLoading).toBe(true);
        expect(result.current.loadingState.isLoading).toBe(false);
    });

    it("initializes view and pagination from URL params", () => {
        const { result } = renderUseMyEventListingState("view=joined&page=3");

        expect(result.current.view.initialView).toBe("joined");
        expect(result.current.view.activeView).toBe("joined");

        expect(result.current.paginationState.initialPage).toBe(3);
        expect(result.current.paginationState.pagination.page).toBe(3);
    });

    it("uses fallback view when URL view is invalid", () => {
        const { result } = renderUseMyEventListingState("view=unknown&page=2");

        expect(result.current.view.initialView).toBe("created");
        expect(result.current.view.activeView).toBe("created");

        expect(result.current.paginationState.initialPage).toBe(2);
        expect(result.current.paginationState.pagination.page).toBe(2);
    });

    it("supports a custom fallback view", () => {
        const { result } = renderUseMyEventListingState("view=unknown", {
            fallbackView: "joined"
        });

        expect(result.current.view.initialView).toBe("joined");
        expect(result.current.view.activeView).toBe("joined");
    });

    it("falls back to page 1 when URL page is invalid", () => {
        const { result } = renderUseMyEventListingState("page=invalid");

        expect(result.current.paginationState.initialPage).toBe(1);
        expect(result.current.paginationState.pagination.page).toBe(1);
    });

    /* =============================
       URL SYNCHRONIZATION
    ============================= */

    it("syncs filters, page and view to URL search params", () => {
        const { result, setSearchParams } = renderUseMyEventListingState();

        act(() => {
            result.current.syncUrl(
                {
                    search: "react",
                    type: "workshop"
                },
                2,
                "joined"
            );
        });

        expect(setSearchParams).toHaveBeenCalledTimes(1);

        const nextParams = setSearchParams.mock.calls[0][0];

        expect(nextParams.get("search")).toBe("react");
        expect(nextParams.get("type")).toBe("workshop");
        expect(nextParams.get("page")).toBe("2");
        expect(nextParams.get("view")).toBe("joined");
    });

    it("does not include fallback view in URL search params", () => {
        const { result, setSearchParams } = renderUseMyEventListingState();

        act(() => {
            result.current.syncUrl(
                {
                    search: "react"
                },
                1,
                "created"
            );
        });

        const nextParams = setSearchParams.mock.calls[0][0];

        expect(nextParams.has("view")).toBe(false);
        expect(nextParams.has("page")).toBe(false);
        expect(nextParams.get("search")).toBe("react");
    });

    /* =============================
       PAGINATION
    ============================= */

    it("resets pagination to the first page", () => {
        const { result } = renderUseMyEventListingState("page=4");

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
        const { result } = renderUseMyEventListingState();

        const filters = {
            search: "react",
            date: "2026-05-18",
            startDate: "2026-05-18",
            endDate: "2026-05-19"
        };

        const nextFilters = result.current.view.getFiltersForView(filters, "created");

        expect(nextFilters).toEqual(filters);
    });

    it("clears date filters when the target view requires date reset", () => {
        const { result } = renderUseMyEventListingState();

        const filters = {
            search: "react",
            date: "2026-05-18",
            startDate: "2026-05-18",
            endDate: "2026-05-19"
        };

        const nextFilters = result.current.view.getFiltersForView(filters, "createdHistory");

        expect(nextFilters).toEqual({
            search: "react",
            date: "",
            startDate: "",
            endDate: ""
        });
    });
});
