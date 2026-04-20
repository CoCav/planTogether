/* ==================================================
   PAGINATION HELPER
    Centralizes pagination and sorting logic
================================================== */
const getPaginationOptions = (query = {}, allowedSortFields = [], defaultSortField = "createdAt", defaultOrder = "DESC") => {
    const {
        page = 1,
        pageSize = 10,
        sortBy = defaultSortField,
        order = defaultOrder,
    } = query;

    const limit = Math.min(parseInt(pageSize, 10) || 10, 100);
    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (currentPage - 1) * limit;

    const orderField = allowedSortFields.includes(sortBy) ? sortBy : defaultSortField;
    const orderDirection = String(order).toLowerCase() === "asc" ? "ASC" : "DESC";

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