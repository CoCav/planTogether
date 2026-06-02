/* ==================================================
   PAGINATION

   Handles:
   - page and pageSize normalization
   - offset calculation
   - sorting validation
   - grouped count normalization
   - total page calculation

   Notes:
   - pageSize is capped to prevent abuse
   - sort fields must be explicitly allowed
   - grouped Sequelize counts can return arrays
================================================== */

/* =============================
   PAGINATION OPTIONS
============================= */

// Build pagination and sorting options from query params
const getPaginationOptions = (query = {}, allowedSortFields = [], defaultSortField = "createdAt", defaultOrder = "DESC") => {

    const {
        page = 1,
        pageSize = 10,
        sortBy = defaultSortField,
        order = defaultOrder
    } = query;

    // Limit page size to prevent heavy queries
    const limit = Math.min(parseInt(pageSize, 10) || 10, 100);

    // Ensure page is always greater than or equal to 1
    const currentPage = Math.max(parseInt(page, 10) || 1, 1);

    const offset = (currentPage - 1) * limit;

    // Only allow safe sorting fields
    const orderField = allowedSortFields.includes(sortBy)
        ? sortBy
        : defaultSortField;

    const orderDirection =
        String(order).toLowerCase() === "asc" ? "ASC" : "DESC";

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
   COUNT HELPERS
============================= */

// Normalize Sequelize count results from grouped and non-grouped queries
const getTotalCount = (count) => {
    return Array.isArray(count) ? count.length : count;
};

/* =============================
   PAGE HELPERS
============================= */

// Calculate total pages from total items and page size
const getTotalPages = (totalItems, pageSize) => {
    return Math.ceil(totalItems / pageSize);
};

module.exports = { getPaginationOptions, getTotalCount, getTotalPages };
