import { useCallback, useMemo, useState } from "react";

import { buildEventSearchParams, getInitialPageFromUrl, getInitialViewFromUrl } from "../eventQueryParams";

import { getEventViewContent, PUBLIC_EVENT_VIEWS } from "../eventViewConfig";

/* ==================================================
   USE EVENT LISTING STATE
   Handles public event listing UI and URL-related state

   Handles:
   - initial URL-derived view and pagination
   - feedback messages
   - loading state
   - active view state
   - pagination state
   - URL synchronization
   - view-based filter cleanup
================================================== */

export default function useEventListingState({ searchParams, setSearchParams, fallbackView = "all" }) {

    /* =============================
       INITIAL URL STATE
    ============================= */

    const initialView = useMemo(
        () => getInitialViewFromUrl(
            searchParams,
            PUBLIC_EVENT_VIEWS,
            fallbackView
        ),
        [searchParams, fallbackView]
    );

    const initialPage = useMemo(
        () => getInitialPageFromUrl(searchParams),
        [searchParams]
    );

    /* =============================
       FEEDBACK STATE
    ============================= */

    const [message, setMessage] = useState("");
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

        setSearchParams(
            buildEventSearchParams({
                filters: nextFilters,
                page: nextPage,
                view: nextView
            })
        );

    }, [setSearchParams]);

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

    // Clears date filters when entering specific views
    const getFiltersForView = useCallback((filters, nextView) => {

        const nextViewContent = getEventViewContent(nextView);

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
            message,
            setMessage,
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
