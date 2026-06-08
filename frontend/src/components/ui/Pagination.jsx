import { ChevronLeft, ChevronRight } from "lucide-react";

import Button from "./Button";

/* ==================================================
   PAGINATION
   Displays navigation controls for paginated data

   Handles:
   - previous / next navigation
   - current page display
   - accessible pagination landmark
   - decorative navigation icons
================================================== */

export default function Pagination({
    page,
    totalPages,
    onPrevious,
    onNext,
    label = "Pagination"
}) {

    /* =========================
       VISIBILITY
    ========================= */

    if (totalPages <= 1) {
        return null;
    }

    return (
        <nav className="pagination" aria-label={label}>
            <Button
                type="button"
                variant="outline"
                onClick={onPrevious}
                disabled={page === 1}
            >
                <ChevronLeft aria-hidden="true" />
                Previous
            </Button>

            <span className="pagination-info" aria-live="polite">
                Page {page} of {totalPages}
            </span>

            <Button
                type="button"
                variant="outline"
                onClick={onNext}
                disabled={page === totalPages}
            >
                Next
                <ChevronRight aria-hidden="true" />
            </Button>
        </nav>
    );
}
