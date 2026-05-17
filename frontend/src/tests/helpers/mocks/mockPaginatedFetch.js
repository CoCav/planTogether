/* ==================================================
   PAGINATED FETCH MOCK HELPERS

   Handles:
   - paginated API payload generation
   - single page payloads
   - multi-page payloads
   - pagination metadata defaults

   Notes:
   - shared across pagination and listing tests
================================================== */

/* =============================
   PAGINATED PAYLOADS
============================= */

// Create a paginated payload
export const createMockPaginatedResponse = ({
    items = [],
    page = 1,
    pageSize = 10,
    totalItems = items.length,
    totalPages = 1
} = {}) => {

    return {
        items,
        page,
        pageSize,
        totalItems,
        totalPages
    };
};
