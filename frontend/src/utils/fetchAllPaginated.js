/* ==================================================
   FETCH ALL PAGINATED
   Fetches and merges all pages from a paginated endpoint

   Requires:
   - fetchPage: function that fetches one page
   - normalizePage: function that extracts items from one page
================================================== */

export const fetchAllPaginated = async ({ fetchPage, normalizePage, pageSize = 10 }) => {
    let currentPage = 1;
    let totalPages = 1;
    const allItems = [];

    while (currentPage <= totalPages) {
        const response = await fetchPage({
            page: currentPage,
            pageSize
        });

        const items = normalizePage(response);

        allItems.push(...items);

        totalPages = response.data.totalPages || 1;
        currentPage++;
    }

    return allItems;
};
