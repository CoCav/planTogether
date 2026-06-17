import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import EventReviewActions from "../../../components/eventReviews/EventReviewActions";

/* ==================================================
   EVENT REVIEW ACTIONS TESTS
   Tests review action rendering and callbacks

   Handles:
   - hidden delete action
   - visible delete action
   - delete loading state
   - delete callback

   Notes:
   - review ownership is resolved by EventReviewCard
   - backend remains the source of truth for delete authorization
================================================== */

describe("EventReviewActions", () => {

    /* =============================
       TEST DATA
    ============================= */

    const baseProps = {
        reviewId: 1,
        canDelete: true,
        isDeleting: false,
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
            canDelete: false
        });

        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("should render delete action when deletion is allowed", () => {
        renderEventReviewActions();

        expect(screen.getByRole("button", {
            name: /delete/i
        })).toBeInTheDocument();
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

    /* =============================
       CALLBACKS
    ============================= */

    it("should call onDelete with review id", () => {
        const onDelete = vi.fn();

        renderEventReviewActions({
            onDelete
        });

        fireEvent.click(screen.getByRole("button", {
            name: /delete/i
        }));

        expect(onDelete).toHaveBeenCalledWith(1);
    });
});
