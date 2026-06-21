import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import EventReviewActions from "../../../components/eventReviews/EventReviewActions";

/* ==================================================
   EVENT REVIEW ACTIONS TESTS
   Tests review action rendering and callbacks

   Handles:
   - hidden review actions
   - visible edit action
   - visible delete action
   - edit loading state
   - delete loading state
   - edit callback
   - delete callback

   Notes:
   - review ownership is resolved by EventReviewCard
   - action handlers are delegated to the parent component
================================================== */

describe("EventReviewActions", () => {

    /* =============================
       TEST DATA
    ============================= */

    const baseProps = {
        canManage: true,
        isEditing: false,
        isDeleting: false,
        onEdit: vi.fn(),
        onDelete: vi.fn()
    };

    /* =============================
       TEST HELPERS
    ============================= */

    const renderEventReviewActions = (props = {}) => {
        return render(
            <EventReviewActions
                {...baseProps}
                {...props}
            />
        );
    };

    /* =============================
       VISIBILITY
    ============================= */

    it("should not render delete action when deletion is not allowed", () => {
        renderEventReviewActions({
            canManage: false
        });

        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("should not render review actions when management is not allowed", () => {
        renderEventReviewActions();

        expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
    });

    /* =============================
       LOADING STATE
    ============================= */

    it("should display deleting state", () => {
        renderEventReviewActions({
            isDeleting: true
        });

        expect(screen.getByRole("button", {
            name: /deleting/i
        })).toBeDisabled();
    });

    it("should disable actions while editing", () => {
        renderEventReviewActions({
            isEditing: true
        });

        expect(screen.getByRole("button", { name: /edit/i })).toBeDisabled();

        expect(screen.getByRole("button", { name: /delete/i })).toBeDisabled();
    });

    it("should disable actions while deleting", () => {
        renderEventReviewActions({
            isDeleting: true
        });

        expect(screen.getByRole("button", { name: /deleting/i })).toBeDisabled();
    });

    /* =============================
       CALLBACKS
    ============================= */

    it("should call onEdit", () => {
        const onEdit = vi.fn();

        renderEventReviewActions({
            onEdit
        });

        fireEvent.click(screen.getByRole("button", {
            name: /edit/i
        }));

        expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it("should call onDelete", () => {
        const onDelete = vi.fn();

        renderEventReviewActions({
            onDelete
        });

        fireEvent.click(screen.getByRole("button", {
            name: /delete/i
        }));

        expect(onDelete).toHaveBeenCalledTimes(1);
    });
});
