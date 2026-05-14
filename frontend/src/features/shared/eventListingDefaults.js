/* ==================================================
   EVENT LISTING DEFAULTS
   Provides shared default filters for event listing pages

   Handles:
   - shared event search filters
   - shared date filters
   - shared sorting defaults

   Notes:
   - shared by public events and current user events
================================================== */

export const DEFAULT_EVENT_LISTING_FILTERS = {
    search: "",
    creator: "",
    type: "",
    theme: "",
    mode: "",
    location: "",
    status: "",
    date: "",
    startDate: "",
    endDate: "",
    sortBy: "",
    order: "asc"
};
