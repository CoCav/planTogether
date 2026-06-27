import { useId, useRef, useState } from "react";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";

import { useClickOutside } from "../../hooks/useClickOutside";

import Button from "../ui/Button";

/* ==================================================
   EVENT REVIEW ACTIONS MENU
   Displays available actions for one event review

   Handles:
   - owner-only action menu visibility
   - edit action
   - delete action
   - edit and delete loading states
   - menu toggle state
   - menu close after action
   - outside click detection
   - accessible menu trigger state
   - accessible menu relationship ids
   - decorative action icons

   Notes:
   - review ownership is resolved in EventReviewCard
   - edit and deletion are delegated to the parent component
================================================== */

export default function EventReviewActionsMenu({
    canManage,
    isEditing = false,
    isDeleting = false,
    onEdit,
    onDelete
}) {

    /* =========================
       MENU STATE
    ========================= */

    const [isOpen, setIsOpen] = useState(false);

    const menuRef = useRef(null);
    const menuId = useId();

    /* =========================
       DISPLAY STATE
    ========================= */

    const isDisabled = isEditing || isDeleting;

    /* =========================
       MENU HANDLERS
    ========================= */

    const closeMenu = () => setIsOpen(false);
    const toggleMenu = () => setIsOpen((current) => !current);

    /* =========================
       ACTION HANDLERS
    ========================= */

    const handleEdit = () => {
        onEdit?.();
        closeMenu();
    };

    const handleDelete = () => {
        onDelete?.();
        closeMenu();
    };

    /* =========================
       OUTSIDE CLICK
    ========================= */

    useClickOutside(menuRef, closeMenu, isOpen);

    /* =========================
       VISIBILITY
    ========================= */

    // Review actions are only visible to authorized users
    if (!canManage) return null;

    return (
        <div className="event-review-actions-menu" ref={menuRef}>
            <Button
                type="button"
                variant="outline"
                className="event-review-actions-trigger"
                onClick={toggleMenu}
                disabled={isDisabled}
                aria-expanded={isOpen}
                aria-haspopup="menu"
                aria-controls={isOpen ? menuId : undefined}
            >
                Manage
                <span className="event-review-actions-caret" aria-hidden="true">
                    <ChevronDown />
                </span>
            </Button>

            {isOpen && (
                <div id={menuId} className="event-review-actions-dropdown" role="menu">
                    <button
                        type="button"
                        role="menuitem"
                        className="event-review-actions-dropdown-item"
                        onClick={handleEdit}
                        disabled={isDisabled}
                    >
                        <Pencil aria-hidden="true" />
                        Edit
                    </button>

                    <button
                        type="button"
                        role="menuitem"
                        className="event-review-actions-dropdown-item event-review-actions-dropdown-item-danger event-review-actions-dropdown-item-separated"
                        onClick={handleDelete}
                        disabled={isDisabled}
                    >
                        <Trash2 aria-hidden="true" />
                        {isDeleting ? "Deleting..." : "Delete"}
                    </button>

                </div>
            )}
        </div>
    );
}
