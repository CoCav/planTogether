import { DEFAULT_EVENT_LISTING_FILTERS } from "../../shared/eventListingDefaults";

/* ==================================================
   PUBLIC USER EVENT FILTERS
   Provides filters for public user event listings

   Handles:
   - public user event default filters
   - public user event query keys

   Notes:
   - aligned with GET /users/:id/events
================================================== */

/* =============================
   DEFAULT FILTERS
============================= */

// Returns default filters for public user event listings
export const getDefaultPublicUserEventFilters = () => ({
    ...DEFAULT_EVENT_LISTING_FILTERS
});

/* =============================
   QUERY KEYS
============================= */

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
