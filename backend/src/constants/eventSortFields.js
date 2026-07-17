/* ==========================================================================
   Event Sort Fields

   Defines allowed sort fields for event queries.

   Responsibilities
   - Provide reusable event sorting field lists
   - Keep validators and services synchronized

   Notes
   - EVENT_SORT_FIELDS is used for public and authenticated event listings.
   - EVENT_ADMIN_SORT_FIELDS additionally allows sorting by creator.
=========================================================================== */

/* =============================
   EVENT SORT FIELDS
============================= */

const EVENT_SORT_FIELDS = [
    "startDateTime",
    "title",
    "createdAt"
];

/* =============================
   ADMIN EVENT SORT FIELDS
============================= */
const EVENT_ADMIN_SORT_FIELDS = [
    ...EVENT_SORT_FIELDS,
    "creatorId"
];

module.exports = {
    EVENT_SORT_FIELDS,
    EVENT_ADMIN_SORT_FIELDS
};
