/* ==================================================
   PAGINATION HOOK
   --------------------------------------------------
   Centralizes pagination navigation logic for pages
   that fetch paginated data.

   This hook handles:
   - Previous page navigation
   - Next page navigation
   - Boundary checks for first and last page

   Goal:
   Avoid duplicating pagination handlers across pages
   while keeping data loading logic inside each page.
================================================== */

export default function usePagination({page, totalPages, onPageChange}) {
    /* =========================
     Previous page
        Loads the previous page if available
    ========================= */

    const handlePreviousPage = async () => {
        if (page <= 1) return;
        await onPageChange(page - 1);
    };

    /* =========================
     Next page
        Loads the next page if available
    ========================= */

    const handleNextPage = async () => {
        if (page >= totalPages) return;
        await onPageChange(page + 1);
    };

    return {handlePreviousPage, handleNextPage};
}