import { DEFAULT_EVENT_LISTING_FILTERS } from "../../shared/eventListingDefaults";

/* ==================================================
   MY EVENT FILTERS
   Provides filters for current user event listings

   Handles:
   - current user event default filters
   - current user event query keys

   Notes:
   - aligned with GET /users/me/events
================================================== */

/* =============================
   DEFAULT FILTERS
============================= */

// Returns default filters for current user event listings
export const getDefaultMyEventFilters = () => ({
    ...DEFAULT_EVENT_LISTING_FILTERS,
    view: ""
});

/* =============================
   QUERY KEYS
============================= */

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
