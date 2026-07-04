/* ==================================================
   EVENT LISTING FILTER TEST FACTORY

   Handles:
   - shared listing filter generation

   Notes:
   - shared across public and user event tests
   - accepts overrides for flexible scenarios
================================================== */

/* =============================
   SHARED LISTING FILTERS
============================= */

// Generate shared event listing filters
export const createEventListingFilters = (overrides = {}) => ({
    search: "",
    creator: "",

    type: "",
    theme: "",

    mode: "",
    location: "",
    city: "",
    region: "",
    country: "",

    status: "",

    date: "",
    startDate: "",
    endDate: "",

    sortBy: "",
    order: "asc",

    ...overrides
});
