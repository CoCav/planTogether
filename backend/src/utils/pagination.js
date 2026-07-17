/* ==========================================================================
   Pagination Utilities

   Builds pagination, sorting and count helpers for list endpoints.

   Responsibilities
   - Normalize page and page size query parameters
   - Calculate Sequelize offset and limit values
   - Validate allowed sorting fields
   - Normalize grouped and non-grouped Sequelize counts
   - Calculate total pages

   Notes
   - Page size is capped to prevent heavy queries.
   - Sort fields must be explicitly allowed by the caller.
   - Grouped Sequelize counts can return arrays.
=========================================================================== */

/* =============================
   PAGINATION DEFAULTS
============================= */

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

/* =============================
   SORT DEFAULTS
============================= */

const DEFAULT_SORT_FIELD = "createdAt";
const DEFAULT_SORT_ORDER = "DESC";
const ASC_SORT_ORDER = "ASC";
const DESC_SORT_ORDER = "DESC";

/* =============================
   PAGINATION OPTIONS
============================= */

// Normalize pagination and sorting options
const getPaginationOptions = (
    query = {},
    allowedSortFields = [],
    defaultSortField = DEFAULT_SORT_FIELD,
    defaultOrder = DEFAULT_SORT_ORDER
) => {

    const {
        page = DEFAULT_PAGE,
        pageSize = DEFAULT_PAGE_SIZE,
        sortBy = defaultSortField,
        order = defaultOrder
    } = query;

    // Normalize pagination values
    const limit = Math.min(
        parseInt(pageSize, 10) || DEFAULT_PAGE_SIZE,
        MAX_PAGE_SIZE
    );

    const currentPage = Math.max(
        parseInt(page, 10) || DEFAULT_PAGE,
        DEFAULT_PAGE
    );

    // Calculate the SQL offset for the requested page
    const offset = (currentPage - DEFAULT_PAGE) * limit;

    // Prevent sorting by unsupported database fields
    const orderField = allowedSortFields.includes(sortBy)
        ? sortBy
        : defaultSortField;

    // Normalize the requested sort direction
    const orderDirection = String(order).toLowerCase() === "asc"
        ? ASC_SORT_ORDER
        : DESC_SORT_ORDER;

    return {
        page: currentPage,
        pageSize: limit,
        limit,
        offset,
        orderField,
        orderDirection
    };
};

/* =============================
   PAGINATION COUNTS
============================= */

// Normalize grouped and non-grouped Sequelize counts
const getTotalCount = (count) => {
    return Array.isArray(count) ? count.length : count;
};

// Calculate the total number of pages
const getTotalPages = (totalItems, pageSize) => {
    return Math.ceil(totalItems / pageSize);
};

module.exports = { getPaginationOptions, getTotalCount, getTotalPages };
