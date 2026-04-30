/* ==================================================
   PAGINATION HOOK
   Centralizes pagination navigation logic

   Handles:
   - previous page navigation
   - next page navigation
   - first / last page boundaries
================================================== */

export default function usePagination({ page, totalPages, onPageChange }) {
    /* =========================
       Previous page
       Loads previous page when available
    ========================= */

    const handlePreviousPage = async () => {
        if (page <= 1) return;
        await onPageChange(page - 1);
    };

    /* =========================
       Next page
       Loads next page when available
    ========================= */

    const handleNextPage = async () => {
        if (page >= totalPages) return;
        await onPageChange(page + 1);
    };

    return { handlePreviousPage, handleNextPage };
}
