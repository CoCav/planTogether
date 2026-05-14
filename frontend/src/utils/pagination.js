/* ==================================================
   PAGINATION UTILS
   Helpers for fetching and merging paginated resources

   Requires:
   - fetchPage: function that fetches one page
   - getItems: function that extracts items from one payload
================================================== */

// Fetches and merges all pages from a paginated endpoint
export const fetchAllPaginated = async ({
    fetchPage,
    getItems,
    pageSize = 10
}) => {

    let currentPage = 1;
    let totalPages = 1;

    const allItems = [];

    while (currentPage <= totalPages) {
        const payload = await fetchPage({
            page: currentPage,
            pageSize
        });

        const items = getItems(payload);

        allItems.push(...items);

        totalPages = payload?.totalPages ?? 1;
        currentPage++;
    }

    return allItems;
};
