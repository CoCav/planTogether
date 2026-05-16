/* ==================================================
   PAGINATION TEST FACTORY

   Handles:
   - pagination state generation
   - paginated payload generation
   - pagination fetch mocks

   Notes:
   - shared across frontend unit and component tests
   - accepts overrides for flexible scenarios
================================================== */

/* =============================
   PAGINATION STATE
============================= */

// Generate pagination state
export const createPaginationState = (overrides = {}) => ({
    page: 1,
    pageSize: 10,

    totalItems: 1,
    totalPages: 1,

    ...overrides
});

/* =============================
   PAGINATED PAYLOADS
============================= */

// Generate a generic paginated payload
export const createPaginatedPayload = ({
    itemsKey = "items",
    items = [],
    overrides = {}
} = {}) => ({
    [itemsKey]: items,

    page: 1,
    pageSize: 10,

    totalItems: items.length,
    totalPages: 1,

    message: "Items retrieved",
    success: true,

    ...overrides
});

/* =============================
   FETCH MOCKS
============================= */

// Generate paginated fetch page mock
export const createFetchPageMock = (pages = []) => {
    return async ({ page }) => {
        return (
            pages[page - 1] ||
            createPaginatedPayload()
        );
    };
};
