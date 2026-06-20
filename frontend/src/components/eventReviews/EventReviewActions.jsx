import { Pencil, Trash2 } from "lucide-react";

import Button from "../ui/Button";

/* ==================================================
   EVENT REVIEW ACTIONS
   Displays available actions for one event review

   Handles:
   - owner-only edit action
   - owner-only delete action
   - edit and delete loading states
   - decorative action icons

   Notes:
   - review ownership is resolved in EventReviewCard
   - edit and deletion are delegated to the parent component
================================================== */

export default function EventReviewActions({
    canManage,
    isEditing = false,
    isDeleting = false,
    onEdit,
    onDelete
}) {

    /* =========================
       VISIBILITY
    ========================= */

    // Review actions are only visible to authorized users
    if (!canManage) return null;

    return (
        <div className="event-review-card-actions">
            <Button
                type="button"
                variant="outline"
                onClick={onEdit}
                disabled={isEditing || isDeleting}
            >
                <Pencil aria-hidden="true" />
                Edit
            </Button>

            <Button
                type="button"
                variant="outline-danger"
                onClick={onDelete}
                disabled={isEditing || isDeleting}
            >
                <Trash2 aria-hidden="true" />
                {isDeleting ? "Deleting..." : "Delete"}
            </Button>
        </div>
    );
}
