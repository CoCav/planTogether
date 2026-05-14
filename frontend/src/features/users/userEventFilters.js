import { DEFAULT_EVENT_LISTING_FILTERS } from "../shared/eventListingDefaults";

/* ==================================================
   USER EVENT FILTERS
   Provides user-related event listing filters

   Handles:
   - current user event filters
   - public user event filters

   Notes:
   - aligned with /users/me/events and /users/:id/events
================================================== */

// Returns default filters for current user event listings
export const getDefaultMyEventFilters = () => ({
    ...DEFAULT_EVENT_LISTING_FILTERS,
    view: ""
});

// Returns default filters for public user event listings
export const getDefaultPublicUserEventFilters = () => ({
    ...DEFAULT_EVENT_LISTING_FILTERS
});

// Allowed query keys for GET /users/me/events
export const MY_EVENT_FILTER_QUERY_KEYS = [
    "search",
    "creator",
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

// Allowed query keys for GET /users/:id/events
export const PUBLIC_USER_EVENT_FILTER_QUERY_KEYS = [
    "search",
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
