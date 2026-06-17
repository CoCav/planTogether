import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import EventReviewsSection from "../../../components/eventReviews/EventReviewsSection";

import useEventReviewActions from "../../../features/eventReviews/hooks/useEventReviewActions";
import useEventReviewData from "../../../features/eventReviews/hooks/useEventReviewData";

/* ==================================================
   EVENT REVIEWS SECTION TESTS
   Tests event reviews section configuration

   Handles:
   - section copy
   - review data loading
   - review error display
   - authenticated review form visibility
   - guest review form hiding
   - loading state display
   - review list configuration
   - review create and delete action forwarding

   Notes:
   - mocks review hooks to focus on section configuration
   - mocks child review components to inspect forwarded props
================================================== */

vi.mock("../../../features/eventReviews/hooks/useEventReviewData");
vi.mock("../../../features/eventReviews/hooks/useEventReviewActions");

vi.mock("../../../components/eventReviews/EventReviewForm", () => ({
    default: ({ onSubmit, isSubmitting }) => (
        <form
            data-testid="event-review-form"
            data-submitting={String(isSubmitting)}
            onSubmit={(event) => {
                event.preventDefault();
                onSubmit({ comment: "Great event!" });
            }}
        >
            <button type="submit">
                Submit mocked review
            </button>
        </form>
    )
}));

vi.mock("../../../components/eventReviews/EventReviewsList", () => ({
    default: ({ reviews, currentUserId, deletingReviewId, onDelete }) => (
        <div data-testid="event-reviews-list">
            <span>Review count: {reviews.length}</span>
            <span>Current user: {currentUserId ?? "guest"}</span>
            <span>Deleting review: {deletingReviewId ?? "none"}</span>

            <button type="button" onClick={() => onDelete(1)}>
                Delete mocked review
            </button>
        </div>
    )
}));

describe("EventReviewsSection", () => {

    /* =============================
       TEST DATA
    ============================= */

    const reviews = [
        {
            id: 1,
            comment: "Great event!"
        }
    ];

    const baseProps = {
        eventId: 10,
        user: {
            userId: 2
        },
        setMessage: vi.fn()
    };

    const loadReviews = vi.fn();
    const setError = vi.fn();

    const handleCreateReview = vi.fn();
    const handleDeleteReview = vi.fn();

    /* =============================
       TEST HELPERS
    ============================= */

    const setupHookMocks = ({
        reviewsValue = reviews,
        error = "",
        isLoading = false,
        isSubmitting = false,
        deletingReviewId = null
    } = {}) => {
        useEventReviewData.mockReturnValue({
            reviews: reviewsValue,
            error,
            setError,
            isLoading,
            loadReviews
        });

        useEventReviewActions.mockReturnValue({
            isSubmitting,
            deletingReviewId,
            handleCreateReview,
            handleDeleteReview
        });
    };

    const renderEventReviewsSection = (props = {}) => {
        return render(
            <EventReviewsSection
                {...baseProps}
                {...props}
            />
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();

        setupHookMocks();
    });

    /* =============================
       SECTION COPY
    ============================= */

    it("should render section title and subtitle", () => {
        renderEventReviewsSection();

        expect(screen.getByRole("heading", {
            name: /event reviews/i
        })).toBeInTheDocument();

        expect(screen.getByText(
            "See what participants shared after attending this event."
        )).toBeInTheDocument();
    });

    /* =============================
       DATA LOADING
    ============================= */

    it("should load reviews on mount", () => {
        renderEventReviewsSection();

        expect(loadReviews).toHaveBeenCalledTimes(1);
    });

    it("should pass event review dependencies to action hook", () => {
        renderEventReviewsSection();

        expect(useEventReviewActions).toHaveBeenCalledWith({
            eventId: 10,
            loadReviews,
            setMessage: baseProps.setMessage,
            setError
        });
    });

    it("should initialize review data hook with event id", () => {
        renderEventReviewsSection();

        expect(useEventReviewData).toHaveBeenCalledWith({
            eventId: 10
        });
    });

    /* =============================
       FEEDBACK
    ============================= */

    it("should render review error message", () => {
        setupHookMocks({
            error: "Unable to load event reviews"
        });

        renderEventReviewsSection();

        expect(screen.getByText("Unable to load event reviews")).toBeInTheDocument();
    });

    it("should render loading state", () => {
        setupHookMocks({
            isLoading: true
        });

        renderEventReviewsSection();

        expect(screen.getByText("Loading reviews...")).toBeInTheDocument();
        expect(screen.queryByTestId("event-reviews-list")).not.toBeInTheDocument();
    });

    /* =============================
       REVIEW FORM
    ============================= */

    it("should render review form for authenticated users", () => {
        renderEventReviewsSection();

        expect(screen.getByTestId("event-review-form")).toBeInTheDocument();
        expect(screen.getByText("Share your experience")).toBeInTheDocument();
    });

    it("should hide review form for guest users", () => {
        renderEventReviewsSection({
            user: null
        });

        expect(screen.queryByTestId("event-review-form")).not.toBeInTheDocument();
    });

    it("should forward submitting state to review form", () => {
        setupHookMocks({
            isSubmitting: true
        });

        renderEventReviewsSection();

        expect(screen.getByTestId("event-review-form")).toHaveAttribute(
            "data-submitting",
            "true"
        );
    });

    it("should forward create action to review form", () => {
        renderEventReviewsSection();

        screen.getByRole("button", {
            name: /submit mocked review/i
        }).click();

        expect(handleCreateReview).toHaveBeenCalledWith({
            comment: "Great event!"
        });
    });

    /* =============================
       REVIEW LIST
    ============================= */

    it("should render review list", () => {
        renderEventReviewsSection();

        expect(screen.getByText("Participant reviews")).toBeInTheDocument();
        expect(screen.getByTestId("event-reviews-list")).toBeInTheDocument();
        expect(screen.getByText("Review count: 1")).toBeInTheDocument();
    });

    it("should forward current user id to review list", () => {
        renderEventReviewsSection();

        expect(screen.getByText("Current user: 2")).toBeInTheDocument();
    });

    it("should forward guest user state to review list", () => {
        renderEventReviewsSection({
            user: null
        });

        expect(screen.getByText("Current user: guest")).toBeInTheDocument();
    });

    it("should forward deleting review id to review list", () => {
        setupHookMocks({
            deletingReviewId: 1
        });

        renderEventReviewsSection();

        expect(screen.getByText("Deleting review: 1")).toBeInTheDocument();
    });

    it("should forward delete action to review list", () => {
        renderEventReviewsSection();

        screen.getByRole("button", {
            name: /delete mocked review/i
        }).click();

        expect(handleDeleteReview).toHaveBeenCalledWith(1);
    });
});
