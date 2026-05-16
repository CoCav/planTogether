import { createEventListingFilters } from "../../shared/eventListingFiltersFactory";

/* ==================================================
   PUBLIC USER EVENT FILTER TEST FACTORY

   Handles:
   - public user event filter generation

   Notes:
   - aligned with GET /users/:id/events filters
   - accepts overrides for flexible scenarios
================================================== */

/* =============================
   PUBLIC USER EVENT FILTERS
============================= */

// Generate public user event filters
export const createPublicUserEventFilters = (overrides = {}) => ({
    ...createEventListingFilters(),

    ...overrides
});
