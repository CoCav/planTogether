import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import EventReviewsList from "../../../components/eventReviews/EventReviewsList";

/* ==================================================
   EVENT REVIEWS LIST TESTS
   Tests event reviews list rendering and prop forwarding

   Handles:
   - empty state rendering
   - review list rendering
   - accessible list semantics
   - prop forwarding to EventReviewCard
   - update/delete state forwarding
   - action handler forwarding

   Notes:
   - EventReviewCard is mocked to isolate list behavior
   - this test focuses only on list orchestration logic
================================================== */

vi.mock("../../../components/eventReviews/EventReviewCard", () => ({
    default: ({
        review,
        currentUserId,
        deletingReviewId,
        updatingReviewId,
        onDelete,
        onEdit
    }) => (
        <div role="listitem" data-testid={`review-card-${review.id}`}>
            <p>{review.comment}</p>

            <p>Current user: {currentUserId}</p>
            <p>Deleting review: {deletingReviewId}</p>
            <p>Updating review: {updatingReviewId}</p>

            <button type="button" onClick={() => onDelete(review.id)}>
                Delete
            </button>

            <button type="button" onClick={() => onEdit?.(review.id, {})}>
                Edit
            </button>
        </div>
    )
}));

describe("EventReviewsList", () => {

    /* =============================
       TEST DATA
    ============================= */

    const reviews = [
        { id: 1, comment: "Great event!" },
        { id: 2, comment: "Amazing meetup!" }
    ];

    const baseProps = {
        reviews,
        currentUserId: 10,
        updatingReviewId: 1,
        deletingReviewId: 2,
        onDelete: vi.fn(),
        onEdit: vi.fn()
    };

    /* =============================
       TEST HELPERS
    ============================= */

    const renderList = (props = {}) =>
        render(<EventReviewsList {...baseProps} {...props} />);

    /* =========================
       EMPTY STATE
    ========================= */

    it("should render empty state when no reviews", () => {
        renderList({ reviews: [] });

        expect(screen.getByText("No reviews yet")).toBeInTheDocument();
    });

    /* =========================
       LIST RENDERING
    ========================= */

    it("should render review cards", () => {
        renderList();

        expect(screen.getByText("Great event!")).toBeInTheDocument();
        expect(screen.getByText("Amazing meetup!")).toBeInTheDocument();
    });

    it("should render accessible list", () => {
        renderList();

        expect(screen.getByRole("list")).toBeInTheDocument();
        expect(screen.getAllByRole("listitem")).toHaveLength(2);
    });

    /* =========================
       PROP FORWARDING
    ========================= */

    it("should forward currentUserId", () => {
        renderList();

        expect(screen.getAllByText("Current user: 10")).toHaveLength(2);
    });

    it("should forward deletingReviewId", () => {
        renderList();

        expect(screen.getAllByText("Deleting review: 2")).toHaveLength(2);
    });

    it("should forward updatingReviewId", () => {
        renderList();

        expect(screen.getAllByText("Updating review: 1")).toHaveLength(2);
    });

    /* =========================
       ACTION FORWARDING
    ========================= */

    it("should forward onDelete callback", () => {
        const onDelete = vi.fn();

        renderList({ onDelete });

        screen.getAllByText("Delete")[0].click();

        expect(onDelete).toHaveBeenCalledWith(1);
    });

    it("should forward onEdit callback", () => {
        const onEdit = vi.fn();

        renderList({ onEdit });

        screen.getAllByText("Edit")[0].click();

        expect(onEdit).toHaveBeenCalledWith(1, {});
    });
});
