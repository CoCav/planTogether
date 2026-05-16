import { createEventListingFilters } from "../../shared/eventListingFiltersFactory";

/* ==================================================
   MY EVENT FILTER TEST FACTORY

   Handles:
   - current user event filter generation

   Notes:
   - aligned with GET /users/me/events filters
   - accepts overrides for flexible scenarios
================================================== */

/* =============================
   CURRENT USER EVENT FILTERS
============================= */

// Generate current user event filters
export const createMyEventFilters = (overrides = {}) => ({
    ...createEventListingFilters(),

    view: "",

    ...overrides
});
