import { EVENT_PAGE_QUERY_KEY } from "../../shared/eventListingQueryKeys";

import { getDefaultPublicUserEventFilters, PUBLIC_USER_EVENT_FILTER_QUERY_KEYS } from "./publicUserEventFilters";

/* ==================================================
   PUBLIC USER EVENT QUERY PARAMS
   Handles URL ↔ public user event filters synchronization

   Handles:
   - parsing public user event view from URL
   - parsing public user event filters from URL
   - parsing public user event pagination
   - building URL params from public user event state

   Notes:
   - aligned with GET /users/:id/events
   - public user event views support created and joined listings
================================================== */

// Gets initial public user event view from URL params
export const getInitialPublicUserEventViewFromUrl = (searchParams, views, fallbackView = "created") => {
    const view = searchParams.get("view");

    return views.some((item) => item.key === view)
        ? view
        : fallbackView;
};

// Gets the initial public user event page from URL params
export const getInitialPublicUserEventPageFromUrl = (searchParams) => {
    const page = Number(searchParams.get(EVENT_PAGE_QUERY_KEY));

    return Number.isInteger(page) && page > 0 ? page : 1;
};

// Gets initial public user event filters from URL params
export const getInitialPublicUserEventFiltersFromUrl = (searchParams) => {
    const filters = getDefaultPublicUserEventFilters();

    PUBLIC_USER_EVENT_FILTER_QUERY_KEYS.forEach((key) => {
        const value = searchParams.get(key);

        if (value !== null) {
            filters[key] = value;
        }
    });

    return filters;
};

// Builds URL params from public user event filters, page and view
export const buildPublicUserEventSearchParams = ({
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
        params.set("view", view);
    }

    // Omit first page from URL to keep URLs clean
    if (page > 1) {
        params.set(EVENT_PAGE_QUERY_KEY, String(page));
    }

    PUBLIC_USER_EVENT_FILTER_QUERY_KEYS.forEach((key) => {
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
