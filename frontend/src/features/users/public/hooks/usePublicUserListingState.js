import { useCallback, useMemo, useState } from "react";

import { getInitialPageFromUrl } from "../../../shared/eventListingQueryParams";

import {
    buildPublicUserEventSearchParams,
    getInitialPublicUserEventFiltersFromUrl,
    getInitialPublicUserEventViewFromUrl
} from "../publicUserEventQueryParams";

import { getPublicUserEventViewContent, PUBLIC_USER_EVENT_VIEWS } from "../publicUserEventViewConfig";

import { getDefaultPublicUserEventFilters } from "../publicUserEventFilters";

/* ==================================================
   USE PUBLIC USER LISTING STATE
   Handles public user event listing UI and URL-related state

   Handles:
   - initial URL-derived view, filters and pagination
   - feedback messages
   - loading state
   - active view state
   - filter state
   - pagination state
   - URL synchronization
================================================== */

export default function usePublicUserListingState({
    searchParams,
    setSearchParams,
    fallbackView = "created"
}) {

    /* =============================
       INITIAL URL STATE
    ============================= */

    const initialView = useMemo(
        () => getInitialPublicUserEventViewFromUrl(
            searchParams,
            PUBLIC_USER_EVENT_VIEWS,
            fallbackView
        ),
        [
            searchParams,
            fallbackView
        ]
    );

    const initialFilters = useMemo(
        () => getInitialPublicUserEventFiltersFromUrl(searchParams),
        [searchParams]
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
       FILTER STATE
    ============================= */

    const [filters, setFilters] = useState(initialFilters);

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
       VIEW CONTENT
    ============================= */

    const viewContent = useMemo(
        () => getPublicUserEventViewContent(activeView),
        [activeView]
    );

    /* =============================
       URL HELPERS
    ============================= */

    const syncUrl = useCallback((nextFilters, nextPage, nextView) => {

        // Resolve view defaults before generating URL params
        const nextViewContent = getPublicUserEventViewContent(nextView);

        setSearchParams(
            buildPublicUserEventSearchParams({
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
       FILTER HELPERS
    ============================= */

    // Resets filters to public user event defaults
    const resetFilters = useCallback(() => {
        setFilters(getDefaultPublicUserEventFilters());
    }, []);

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
            viewContent
        },

        filtersState: {
            filters,
            setFilters,
            initialFilters,
            resetFilters
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
