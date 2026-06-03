import { EVENT_PAGE_QUERY_KEY, EVENT_VIEW_QUERY_KEY } from "../../shared/eventListingQueryKeys";

import { getDefaultMyEventFilters, MY_EVENT_FILTER_QUERY_KEYS } from "./myEventFilters";

/* ==================================================
   MY EVENT QUERY PARAMS
   Handles URL ↔ current user event filters synchronization

   Handles:
   - parsing current user event filters from URL
   - parsing current user view and pagination
   - building URL params from current user event state

   Notes:
   - aligned with GET /users/me/events backend query validator
   - public user events do not use this view-based query helper
================================================== */

// Gets the initial active current user event view from URL params
export const getInitialMyEventViewFromUrl = (searchParams, views, fallbackView = "created") => {

    const view = searchParams.get(EVENT_VIEW_QUERY_KEY);

    return views.some((item) => item.key === view) ? view : fallbackView;
};

// Gets initial current user event filters from URL params
export const getInitialMyEventFiltersFromUrl = (searchParams) => {
    const filters = getDefaultMyEventFilters();

    MY_EVENT_FILTER_QUERY_KEYS.forEach((key) => {
        const value = searchParams.get(key);

        if (value !== null) {
            filters[key] = value;
        }
    });

    return filters;
};

// Builds URL params from current user event filters
export const buildMyEventSearchParams = ({
    filters = {},
    page = 1,
    view = "created",
    fallbackView = "created",
    defaultSortBy = "startDateTime",
    defaultOrder = "asc"
}) => {

    const params = new URLSearchParams();

    // Omit fallback view to keep URLs clean
    if (view !== fallbackView) {
        params.set(EVENT_VIEW_QUERY_KEY, view);
    }

    // Omit first page from URL
    if (page > 1) {
        params.set(EVENT_PAGE_QUERY_KEY, String(page));
    }

    MY_EVENT_FILTER_QUERY_KEYS.forEach((key) => {
        const value = filters[key];

        // Skip empty filter values
        if (String(value ?? "").trim() === "") {
            return;
        }

        // Skip default sorting values for the active view
        if (key === "sortBy" && value === defaultSortBy) {
            return;
        }

        if (key === "order" && value === defaultOrder) {
            return;
        }

        params.set(key, value);
    });

    return params;
};
