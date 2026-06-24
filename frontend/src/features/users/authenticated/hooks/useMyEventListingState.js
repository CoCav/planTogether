import { useCallback, useMemo, useState } from "react";

import { getInitialPageFromUrl } from "../../../shared/eventListingQueryParams";

import { buildMyEventSearchParams, getInitialMyEventViewFromUrl } from "../myEventQueryParams";

import { getMyEventViewContent, MY_EVENT_VIEWS } from "../myEventViewConfig";

/* ==================================================
   USE MY EVENT LISTING STATE
   Handles current user event listing UI and URL-related state

   Handles:
   - initial URL-derived view and pagination
   - inline error feedback
   - loading state
   - active view state
   - pagination state
   - URL synchronization
   - view-based filter cleanup
================================================== */

export default function useMyEventListingState({ searchParams, setSearchParams, fallbackView = "created" }) {

    /* =============================
       INITIAL URL STATE
    ============================= */

    const initialView = useMemo(
        () => getInitialMyEventViewFromUrl(searchParams, MY_EVENT_VIEWS, fallbackView),
        [
            searchParams,
            fallbackView
        ]
    );

    const initialPage = useMemo(
        () => getInitialPageFromUrl(searchParams),
        [searchParams]
    );

    /* =============================
       FEEDBACK STATE
    ============================= */

    const [error, setError] = useState("");

    /* =============================
       VIEW STATE
    ============================= */

    const [activeView, setActiveView] = useState(initialView);

    /* =============================
       LOADING STATE
    ============================= */

    const [initialLoading, setInitialLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    /* =============================
       PAGINATION STATE
    ============================= */

    const [pagination, setPagination] = useState({
        page: initialPage,
        pageSize: 4,
        totalPages: 1,
        totalEvents: 0
    });

    /* =============================
       URL HELPERS
    ============================= */

    // Syncs filters, page and view with URL search params
    const syncUrl = useCallback((nextFilters, nextPage, nextView) => {
        const nextViewContent = getMyEventViewContent(nextView);

        setSearchParams(
            buildMyEventSearchParams({
                filters: nextFilters,
                page: nextPage,
                view: nextView,
                fallbackView,

                // Allows default sorting values to be omitted from the URL
                defaultSortBy: nextViewContent.defaultSortBy,
                defaultOrder: nextViewContent.defaultOrder
            })
        );
    }, [
        fallbackView,
        setSearchParams
    ]);

    /* =============================
       PAGINATION HELPERS
    ============================= */

    // Resets pagination to the first page
    const resetPage = useCallback(() => {
        setPagination((prev) => ({
            ...prev,
            page: 1
        }));
    }, []);

    /* =============================
       VIEW HELPERS
    ============================= */

    // Clears incompatible date filters when switching views
    const getFiltersForView = useCallback((filters, nextView) => {
        const nextViewContent = getMyEventViewContent(nextView);

        if (!nextViewContent.clearDateFiltersOnEnter) {
            return filters;
        }

        return {
            ...filters,
            date: "",
            startDate: "",
            endDate: ""
        };
    }, []);

    return {
        feedback: {
            error,
            setError
        },

        view: {
            activeView,
            setActiveView,
            initialView,
            getFiltersForView
        },

        loadingState: {
            initialLoading,
            setInitialLoading,
            isLoading,
            setIsLoading
        },

        paginationState: {
            pagination,
            setPagination,
            initialPage
        },

        syncUrl,
        resetPage
    };
}
