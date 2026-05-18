import { DEFAULT_EVENT_LISTING_FILTERS } from "../shared/eventListingDefaults";

/* ==================================================
   EVENT FILTERS
   Provides public event listing filters

   Handles:
   - default filters for GET /events
   - filter-only param extraction
================================================== */

// Returns default filters for public event listings
export const getDefaultEventFilters = () => ({
    ...DEFAULT_EVENT_LISTING_FILTERS,
    creatorId: ""
});

/* =============================
   FILTER HELPERS
============================= */

// Extracts filter-only fields from listing params
export const getEventFilterFields = (filters = {}) => {
    const {
        search,
        creator,
        type,
        theme,
        mode,
        location,
        status,
        date,
        startDate,
        endDate
    } = filters;

    return {
        search,
        creator,
        type,
        theme,
        mode,
        location,
        status,
        date,
        startDate,
        endDate
    };
};
