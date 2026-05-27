import { EVENT_PAGE_QUERY_KEY, EVENT_VIEW_QUERY_KEY } from "../shared/eventListingQueryKeys";

import { EVENT_STATUS } from "../shared/constants/eventStatus";

import { getDefaultEventFilters } from "./eventFilters";

/* ==================================================
   EVENT QUERY PARAMS
   Handles URL ↔ public event filters synchronization

   Handles:
   - parsing public event filters from URL
   - parsing view and pagination
   - building URL params from state

   Notes:
   - aligned with GET /events backend query validator
================================================== */

export const PUBLIC_EVENT_FILTER_QUERY_KEYS = [
    "search",
    "creator",
    "creatorId",
    "type",
    "theme",
    "mode",
    "location",
    "status",
    "date",
    "startDate",
    "endDate",
    "sortBy",
    "order"
];

// Gets the initial active view from URL params
export const getInitialViewFromUrl = (searchParams, views, fallbackView = EVENT_STATUS.ONGOING) => {

    const view = searchParams.get(EVENT_VIEW_QUERY_KEY);

    return views.some((item) => item.key === view) ? view : fallbackView;
};

// Gets initial public event filters from URL params
export const getInitialEventFiltersFromUrl = (searchParams) => {
    const filters = getDefaultEventFilters();

    PUBLIC_EVENT_FILTER_QUERY_KEYS.forEach((key) => {
        const value = searchParams.get(key);

        if (value !== null) {
            filters[key] = value;
        }
    });

    return filters;
};

// Builds URL params from public event filters
export const buildEventSearchParams = ({ filters = {}, page = 1, view = EVENT_STATUS.ONGOING, fallbackView = EVENT_STATUS.ONGOING }) => {

    const params = new URLSearchParams();

    if (view !== fallbackView) {
        params.set(EVENT_VIEW_QUERY_KEY, view);
    }

    if (page > 1) {
        params.set(EVENT_PAGE_QUERY_KEY, String(page));
    }

    PUBLIC_EVENT_FILTER_QUERY_KEYS.forEach((key) => {
        const value = filters[key];

        if (String(value ?? "").trim() !== "") {
            params.set(key, value);
        }
    });

    return params;
};
