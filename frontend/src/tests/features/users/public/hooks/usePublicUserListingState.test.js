import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import usePublicUserListingState from "../../../../../features/users/public/hooks/usePublicUserListingState";

/* ==================================================
   USE PUBLIC USER LISTING STATE TESTS
   Tests public user event listing UI and URL-related state

   Handles:
   - initial URL-derived view, filters and pagination
   - feedback state updates
   - loading state updates
   - active view state updates
   - filter state updates and reset
   - pagination state updates and reset
   - URL synchronization
   - clean URL synchronization
   - view content resolution
================================================== */

describe("usePublicUserListingState", () => {

    /* =============================
       TEST HELPERS
    ============================= */

    const createSearchParams = (query = "") => {
        return new URLSearchParams(query);
    };

    const renderUsePublicUserListingState = ({
        searchParams = createSearchParams(),
        setSearchParams = vi.fn(),
        fallbackView = "created"
    } = {}) => {
        return renderHook(() =>
            usePublicUserListingState({
                searchParams,
                setSearchParams,
                fallbackView
            })
        );
    };

    /* =============================
       TEST SETUP
    ============================= */

    beforeEach(() => {
        vi.clearAllMocks();
    });

    /* =============================
       INITIAL URL STATE
    ============================= */

    it("should initialize state from default URL values", () => {
        const { result } = renderUsePublicUserListingState();

        expect(result.current.view.initialView).toBe("created");
        expect(result.current.view.activeView).toBe("created");

        expect(result.current.paginationState.initialPage).toBe(1);
        expect(result.current.paginationState.pagination).toEqual({
            page: 1,
            pageSize: 4,
            totalPages: 1,
            totalEvents: 0
        });
    });

    it("should initialize view, filters and page from URL params", () => {
        const { result } = renderUsePublicUserListingState({
            searchParams: createSearchParams(
                "view=joined&page=3&search=react&type=workshop&sortBy=title&order=desc"
            )
        });

        expect(result.current.view.initialView).toBe("joined");
        expect(result.current.view.activeView).toBe("joined");

        expect(result.current.filtersState.initialFilters).toEqual(
            expect.objectContaining({
                search: "react",
                type: "workshop",
                sortBy: "title",
                order: "desc"
            })
        );

        expect(result.current.paginationState.initialPage).toBe(3);
        expect(result.current.paginationState.pagination.page).toBe(3);
    });

    it("should fallback to page 1 when URL page is invalid", () => {
        const { result } = renderUsePublicUserListingState({
            searchParams: createSearchParams("page=abc")
        });

        expect(result.current.paginationState.initialPage).toBe(1);
        expect(result.current.paginationState.pagination.page).toBe(1);
    });

    it("should fallback to created view when URL view is invalid", () => {
        const { result } = renderUsePublicUserListingState({
            searchParams: createSearchParams("view=invalid")
        });

        expect(result.current.view.initialView).toBe("created");
        expect(result.current.view.activeView).toBe("created");
    });

    it("should support custom fallback view", () => {
        const { result } = renderUsePublicUserListingState({
            searchParams: createSearchParams("view=invalid"),
            fallbackView: "joined"
        });

        expect(result.current.view.initialView).toBe("joined");
        expect(result.current.view.activeView).toBe("joined");
    });

    /* =============================
       FEEDBACK STATE
    ============================= */

    it("should update feedback state", () => {
        const { result } = renderUsePublicUserListingState();

        act(() => {
            result.current.feedback.setMessage("Saved");
            result.current.feedback.setError("Failed");
        });

        expect(result.current.feedback.message).toBe("Saved");
        expect(result.current.feedback.error).toBe("Failed");
    });

    /* =============================
       VIEW STATE
    ============================= */

    it("should update active view and resolve view content", () => {
        const { result } = renderUsePublicUserListingState();

        act(() => {
            result.current.view.setActiveView("joined");
        });

        expect(result.current.view.activeView).toBe("joined");
        expect(result.current.view.viewContent.key).toBe("joined");
        expect(result.current.view.viewContent.title).toBe("Joined Events");
    });

    /* =============================
       FILTER STATE
    ============================= */

    it("should update filters", () => {
        const { result } = renderUsePublicUserListingState();

        act(() => {
            result.current.filtersState.setFilters((prev) => ({
                ...prev,
                search: "music",
                status: "upcoming"
            }));
        });

        expect(result.current.filtersState.filters).toEqual(
            expect.objectContaining({
                search: "music",
                status: "upcoming"
            })
        );
    });

    it("should reset filters to default public user event filters", () => {
        const { result } = renderUsePublicUserListingState({
            searchParams: createSearchParams("search=react&status=upcoming")
        });

        act(() => {
            result.current.filtersState.resetFilters();
        });

        expect(result.current.filtersState.filters).toEqual(
            expect.objectContaining({
                search: "",
                status: ""
            })
        );
    });

    /* =============================
       LOADING STATE
    ============================= */

    it("should update loading state", () => {
        const { result } = renderUsePublicUserListingState();

        act(() => {
            result.current.loadingState.setInitialLoading(false);
            result.current.loadingState.setIsLoading(true);
        });

        expect(result.current.loadingState.initialLoading).toBe(false);
        expect(result.current.loadingState.isLoading).toBe(true);
    });

    /* =============================
       PAGINATION STATE
    ============================= */

    it("should update pagination state", () => {
        const { result } = renderUsePublicUserListingState();

        act(() => {
            result.current.paginationState.setPagination((prev) => ({
                ...prev,
                page: 4,
                totalPages: 8,
                totalEvents: 30
            }));
        });

        expect(result.current.paginationState.pagination).toEqual({
            page: 4,
            pageSize: 4,
            totalPages: 8,
            totalEvents: 30
        });
    });

    it("should reset pagination to first page", () => {
        const { result } = renderUsePublicUserListingState({
            searchParams: createSearchParams("page=5")
        });

        act(() => {
            result.current.resetPage();
        });

        expect(result.current.paginationState.pagination.page).toBe(1);
    });

    /* =============================
       URL SYNCHRONIZATION
    ============================= */

    it("should sync filters, page and view with URL search params", () => {
        const setSearchParams = vi.fn();

        const { result } = renderUsePublicUserListingState({
            setSearchParams
        });

        act(() => {
            result.current.syncUrl(
                {
                    search: "react",
                    status: "",
                    sortBy: "title",
                    order: "asc"
                },
                2,
                "joined"
            );
        });

        expect(setSearchParams).toHaveBeenCalledTimes(1);

        const params = setSearchParams.mock.calls[0][0];

        expect(params.get("search")).toBe("react");
        expect(params.get("status")).toBe(null);
        expect(params.get("sortBy")).toBe("title");
        expect(params.has("order")).toBe(false);
        expect(params.get("page")).toBe("2");
        expect(params.get("view")).toBe("joined");
    });

    it("should omit fallback view from URL search params", () => {
        const setSearchParams = vi.fn();

        const { result } = renderUsePublicUserListingState({
            setSearchParams
        });

        act(() => {
            result.current.syncUrl(
                {},
                1,
                "created"
            );
        });

        const params = setSearchParams.mock.calls[0][0];

        expect(params.get("view")).toBe(null);
        expect(params.get("page")).toBe(null);
    });

    it("should omit default sorting values from URL search params", () => {
        const setSearchParams = vi.fn();

        const { result } = renderUsePublicUserListingState({
            setSearchParams
        });

        act(() => {
            result.current.syncUrl(
                {
                    search: "react",
                    sortBy: "startDateTime",
                    order: "asc"
                },
                1,
                "created"
            );
        });

        const params = setSearchParams.mock.calls[0][0];

        expect(params.get("search")).toBe("react");

        expect(params.has("sortBy")).toBe(false);
        expect(params.has("order")).toBe(false);
    });

    it("should keep non-default sorting values in URL search params", () => {
        const setSearchParams = vi.fn();

        const { result } = renderUsePublicUserListingState({
            setSearchParams
        });

        act(() => {
            result.current.syncUrl(
                {
                    sortBy: "title",
                    order: "desc"
                },
                1,
                "created"
            );
        });

        const params = setSearchParams.mock.calls[0][0];

        expect(params.get("sortBy")).toBe("title");
        expect(params.get("order")).toBe("desc");
    });

    it("should omit default sorting values for joined view", () => {
        const setSearchParams = vi.fn();

        const { result } = renderUsePublicUserListingState({
            setSearchParams
        });

        act(() => {
            result.current.syncUrl(
                {
                    sortBy: "startDateTime",
                    order: "asc"
                },
                1,
                "joined"
            );
        });

        const params = setSearchParams.mock.calls[0][0];

        expect(params.get("view")).toBe("joined");

        expect(params.has("sortBy")).toBe(false);
        expect(params.has("order")).toBe(false);
    });
});
