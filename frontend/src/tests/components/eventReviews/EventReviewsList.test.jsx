import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import EventReviewsList from "../../../components/eventReviews/EventReviewsList";

/* ==================================================
   EVENT REVIEWS LIST TESTS
   Tests event review list rendering

   Handles:
   - empty review state
   - review card rendering
   - accessible list semantics
   - current user ownership forwarding
   - delete state forwarding
   - delete action forwarding

   Notes:
   - EventReviewCard is mocked to focus on list behavior
   - review loading state is handled by EventReviewsSection
================================================== */

vi.mock("../../../components/eventReviews/EventReviewCard", () => ({
    default: ({ review, currentUserId, deletingReviewId, onDelete }) => (
        <div role="listitem" data-testid={`review-card-${review.id}`}>
            <p>{review.comment}</p>
            <p>Current user: {currentUserId}</p>
            <p>Deleting review: {deletingReviewId}</p>

            <button type="button" onClick={() => onDelete(review.id)}>
                Delete {review.id}
            </button>
        </div>
    )
}));

describe("EventReviewsList", () => {

    /* =============================
       TEST DATA
    ============================= */

    const reviews = [
        {
            id: 1,
            comment: "Great event!"
        },
        {
            id: 2,
            comment: "Amazing meetup!"
        }
    ];

    const baseProps = {
        reviews,
        currentUserId: 10,
        deletingReviewId: null,
        onDelete: vi.fn()
    };

    /* =============================
       TEST HELPERS
    ============================= */

    const renderEventReviewsList = (props = {}) => {
        return render(
            <EventReviewsList
                {...baseProps}
                {...props}
            />
        );
    };

    /* =============================
       EMPTY STATE
    ============================= */

    it("should render empty state when there are no reviews", () => {
        renderEventReviewsList({
            reviews: []
        });

        expect(screen.getByText("No reviews yet")).toBeInTheDocument();

        expect(screen.getByText(
            "Reviews will appear here once participants share their experience."
        )).toBeInTheDocument();
    });

    /* =============================
       REVIEW CARDS
    ============================= */

    it("should render review cards", () => {
        renderEventReviewsList();

        expect(screen.getByText("Great event!")).toBeInTheDocument();
        expect(screen.getByText("Amazing meetup!")).toBeInTheDocument();
    });

    it("should render reviews as an accessible list", () => {
        renderEventReviewsList();

        expect(screen.getByRole("list")).toBeInTheDocument();
        expect(screen.getAllByRole("listitem")).toHaveLength(2);
    });

    /* =============================
       PROP FORWARDING
    ============================= */

    it("should forward current user id to review cards", () => {
        renderEventReviewsList();

        expect(screen.getAllByText("Current user: 10")).toHaveLength(2);
    });

    it("should forward deleting review id to review cards", () => {
        renderEventReviewsList({
            deletingReviewId: 2
        });

        expect(screen.getAllByText("Deleting review: 2")).toHaveLength(2);
    });

    it("should forward delete action to review cards", () => {
        const onDelete = vi.fn();

        renderEventReviewsList({
            onDelete
        });

        screen.getByRole("button", {
            name: /delete 1/i
        }).click();

        expect(onDelete).toHaveBeenCalledWith(1);
    });
});
