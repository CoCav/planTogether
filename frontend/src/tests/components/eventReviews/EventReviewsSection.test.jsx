import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

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
   - authenticated review form accordion
   - guest review form hiding
   - accessible loading state display
   - review list configuration
   - review create and delete action forwarding
   - review summary display
   - missing review summary hiding

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
                onSubmit({
                    rating: 5,
                    comment: "Great event!"
                });
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
        setMessage: vi.fn(),
        reviewLabel: "4 ★ (1 review)"
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

    it("should render review summary when provided", () => {
        renderEventReviewsSection();

        expect(screen.getByLabelText("Event review summary")).toHaveTextContent("4 ★ (1 review)");
    });

    it("should hide review summary when missing", () => {
        renderEventReviewsSection({
            reviewLabel: null
        });

        expect(screen.queryByLabelText("Event review summary")).not.toBeInTheDocument();
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

        expect(screen.getByRole("status")).toBeInTheDocument();
        expect(screen.getByText("Loading reviews...")).toBeInTheDocument();
        expect(screen.getByText("Fetching participant reviews for this event.")).toBeInTheDocument();
        expect(screen.queryByTestId("event-reviews-list")).not.toBeInTheDocument();
    });

    /* =============================
       REVIEW FORM ACCORDION
    ============================= */

    it("should show review form toggle for authenticated users", () => {
        renderEventReviewsSection();

        expect(screen.getByRole("button", {
            name: /write a review/i
        })).toBeInTheDocument();

        expect(screen.getByRole("button", {
            name: /write a review/i
        })).toHaveAttribute("aria-expanded", "false");
    });

    it("should hide review form by default", () => {
        renderEventReviewsSection();

        expect(screen.queryByTestId("event-review-form")).not.toBeInTheDocument();
    });

    it("should open review form when clicking toggle", () => {
        renderEventReviewsSection();

        fireEvent.click(screen.getByRole("button", {
            name: /write a review/i
        }));

        expect(screen.getByTestId("event-review-form")).toBeInTheDocument();

        expect(screen.getByRole("button", {
            name: /hide review form/i
        })).toHaveAttribute("aria-expanded", "true");
    });

    it("should hide review form for guest users", () => {
        renderEventReviewsSection({
            user: null
        });

        expect(screen.queryByRole("button", {
            name: /write a review/i
        })).not.toBeInTheDocument();

        expect(screen.queryByTestId("event-review-form")).not.toBeInTheDocument();
    });

    it("should forward submitting state to review form", () => {
        setupHookMocks({
            isSubmitting: true
        });

        renderEventReviewsSection();

        fireEvent.click(screen.getByRole("button", {
            name: /write a review/i
        }));

        expect(screen.getByTestId("event-review-form")).toHaveAttribute(
            "data-submitting",
            "true"
        );
    });

    it("should forward create action to review form and close form after submit", async () => {
        handleCreateReview.mockResolvedValue(undefined);

        renderEventReviewsSection();

        fireEvent.click(screen.getByRole("button", {
            name: /write a review/i
        }));

        fireEvent.click(screen.getByRole("button", {
            name: /submit mocked review/i
        }));

        expect(handleCreateReview).toHaveBeenCalledWith({
            rating: 5,
            comment: "Great event!"
        });

        await waitFor(() => {
            expect(screen.queryByTestId("event-review-form")).not.toBeInTheDocument();
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
