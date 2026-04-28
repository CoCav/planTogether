/* ==================================================
   PAGINATION
   Reusable pagination controls for paginated lists
================================================== */

import Button from "./Button";

export default function Pagination({page, totalPages, onPrevious, onNext}) {
    if (totalPages <= 1) return null;

    return (
        <div className="pagination">
            <Button type="button" variant="outline" onClick={onPrevious} disabled={page === 1}>Previous</Button>
            <span className="pagination-info">Page {page} of {totalPages}</span>
            <Button type="button" variant="outline" onClick={onNext} disabled={page === totalPages}>Next</Button>
        </div>
    );
}