/* ==================================================
   FETCH ALL PAGINATED
   Fetches all pages from a paginated API endpoint
   and returns a single merged array
================================================== */

export const fetchAllPaginated = async ({fetchPage, normalizePage, pageSize = 10 }) => {
    let currentPage = 1;
    let totalPages = 1;
    const allItems = [];

    while (currentPage <= totalPages) {
        const response = await fetchPage({
            page: currentPage,
            pageSize,
        });

        const items = normalizePage(response);
        allItems.push(...items);

        totalPages = response.data.totalPages || 1;
        currentPage++;
    }

    return allItems;
};