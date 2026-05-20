import { EVENT_PAGE_QUERY_KEY } from "./eventListingQueryKeys";

/* ==================================================
   EVENT LISTING QUERY PARAMS
   Shared URL query param helpers for event listings

   Handles:
   - pagination query parsing

   Notes:
   - shared by public events and current user events
================================================== */

// Gets the initial page from URL params
export const getInitialPageFromUrl = (searchParams) => {
    const page = Number(searchParams.get(EVENT_PAGE_QUERY_KEY));

    return Number.isInteger(page) && page > 0 ? page : 1;
};
