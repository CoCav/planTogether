import { EVENT_PAGE_QUERY_KEY, EVENT_VIEW_QUERY_KEY } from "../shared/eventListingQueryKeys";

import { getDefaultUserEventFilters, USER_EVENT_FILTER_QUERY_KEYS } from "./userEventFilter";

/* ==================================================
   USER EVENT QUERY PARAMS
   Handles URL ↔ current user event filters synchronization

   Handles:
   - parsing current user event filters from URL
   - parsing view and pagination
   - building URL params from state

   Notes:
   - aligned with GET /users/me/events backend query validator
================================================== */

// Gets the initial active user event view from URL params
export const getInitialUserEventViewFromUrl = (searchParams, views, fallbackView = "created") => {
    const view = searchParams.get(EVENT_VIEW_QUERY_KEY);

    return views.some((item) => item.key === view) ? view : fallbackView;
};

// Gets initial current user event filters from URL params
export const getInitialUserEventFiltersFromUrl = (searchParams) => {
    const filters = getDefaultUserEventFilters();

    USER_EVENT_FILTER_QUERY_KEYS.forEach((key) => {
        const value = searchParams.get(key);

        if (value !== null) {
            filters[key] = value;
        }
    });

    return filters;
};

// Builds URL params from current user event filters
export const buildUserEventSearchParams = ({ filters = {}, page = 1, view = "created", fallbackView = "created" }) => {
    const params = new URLSearchParams();

    if (view !== fallbackView) {
        params.set(EVENT_VIEW_QUERY_KEY, view);
    }

    if (page > 1) {
        params.set(EVENT_PAGE_QUERY_KEY, String(page));
    }

    USER_EVENT_FILTER_QUERY_KEYS.forEach((key) => {
        const value = filters[key];

        if (String(value ?? "").trim() !== "") {
            params.set(key, value);
        }
    });

    return params;
};
