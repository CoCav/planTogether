import { createEventListingFilters } from "../shared/eventListingFiltersFactory";

/* ==================================================
   EVENT FILTER TEST FACTORY

   Handles:
   - public event filter generation

   Notes:
   - aligned with GET /events filters
   - accepts overrides for flexible scenarios
================================================== */

/* =============================
   PUBLIC EVENT FILTERS
============================= */

// Generate public event filters
export const createEventFilters = (overrides = {}) => ({
    ...createEventListingFilters(),

    creatorId: "",

    ...overrides
});
