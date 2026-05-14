import { DEFAULT_EVENT_LISTING_FILTERS } from "../shared/eventListingDefaults";

/* ==================================================
   EVENT FILTERS
   Provides public event listing filters

   Handles:
   - default filters for GET /events

   Notes:
   - aligned with public event listing
================================================== */

// Returns default filters for public event listings
export const getDefaultEventFilters = () => ({
    ...DEFAULT_EVENT_LISTING_FILTERS,
    creatorId: ""
});
