import { Trash2 } from "lucide-react";

import Button from "../ui/Button";

/* ==================================================
   EVENT REVIEW ACTIONS
   Displays available actions for one event review

   Handles:
   - owner-only delete action
   - delete loading state
   - decorative action icon

   Notes:
   - review ownership is resolved in EventReviewCard
   - deletion is delegated to the parent component
================================================== */

export default function EventReviewActions({ reviewId, canDelete, isDeleting, onDelete }) {

    /* =========================
       VISIBILITY
    ========================= */

    // Review actions are only visible to the review owner
    if (!canDelete) return null;

    return (
        <div className="event-review-card-actions">
            <Button
                type="button"
                variant="outline-danger"
                onClick={() => onDelete?.(reviewId)}
                disabled={isDeleting}
            >
                <Trash2 aria-hidden="true" />
                {isDeleting ? "Deleting..." : "Delete"}
            </Button>
        </div>
    );
}
