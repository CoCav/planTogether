/* ==================================================
   PAGINATION HOOK
   Centralizes pagination navigation logic

   Handles:
   - previous page navigation
   - next page navigation
   - page boundary protection
================================================== */

export default function usePagination({ page, totalPages, onPageChange }) {
    // Loads previous page when available
    const goToPreviousPage = async () => {
        if (page <= 1) return;

        await onPageChange(page - 1);
    };

    // Loads next page when available
    const goToNextPage = async () => {
        if (page >= totalPages) return;

        await onPageChange(page + 1);
    };

    return {
        goToPreviousPage,
        goToNextPage
    };
}
