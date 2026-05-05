/* ==================================================
   PAGINATION

   Handles:
   - page & pageSize normalization
   - offset calculation
   - sorting validation

   Notes:
   - pageSize is capped to prevent abuse
   - sort field must be whitelisted
================================================== */

// Build pagination + sorting options from query params
const getPaginationOptions = (query = {}, allowedSortFields = [], defaultSortField = "createdAt", defaultOrder = "DESC") => {

    const {
        page = 1,
        pageSize = 10,
        sortBy = defaultSortField,
        order = defaultOrder
    } = query;

    // Limit page size to prevent heavy queries
    const limit = Math.min(parseInt(pageSize, 10) || 10, 100);

    // Ensure page is always >= 1
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

module.exports = { getPaginationOptions };
