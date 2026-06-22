import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import EventReviewsSection from "../../../components/eventReviews/EventReviewsSection";

import useEventReviewActions from "../../../features/eventReviews/hooks/useEventReviewActions";
import useEventReviewData from "../../../features/eventReviews/hooks/useEventReviewData";

/* ==================================================
   EVENT REVIEWS SECTION TESTS
   Tests event reviews section orchestration

   Handles:
   - section rendering (title, subtitle, summary pill)
   - review statistics display (global average rating + total count)
   - paginated review loading lifecycle
   - review pagination controls
   - review form toggle behavior
   - review creation flow
   - review update flow
   - review deletion flow
   - props forwarding to child components

   Notes:
   - hooks are mocked to isolate orchestration logic
   - child components are mocked for controlled assertions
   - pagination uses shared usePagination and Pagination components
================================================== */

vi.mock("../../../features/eventReviews/hooks/useEventReviewData");
vi.mock("../../../features/eventReviews/hooks/useEventReviewActions");

vi.mock("../../../components/eventReviews/EventReviewForm", () => ({
    default: ({ onSubmit, isSubmitting }) => (
        <form
            data-testid="event-review-form"
            data-submitting={String(isSubmitting)}
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit({
                    rating: 5,
                    comment: "Great event!"
                });
            }}
        >
            <button type="submit">Submit</button>
        </form>
    )
}));

vi.mock("../../../components/eventReviews/EventReviewsList", () => ({
    default: ({
        reviews,
        currentUserId,
        updatingReviewId,
        deletingReviewId,
        onDelete,
        onEdit
    }) => (
        <div data-testid="event-reviews-list">
            <p>count:{reviews.length}</p>
            <p>user:{currentUserId ?? "guest"}</p>
            <p>updating:{updatingReviewId ?? "none"}</p>
            <p>deleting:{deletingReviewId ?? "none"}</p>

            <button onClick={() => onDelete(1)}>delete</button>
            <button onClick={() => onEdit(1, {})}>edit</button>
        </div>
    )
}));

describe("EventReviewsSection", () => {

    /* =============================
       TEST DATA
    ============================= */

    const reviews = [{ id: 1, comment: "Great", rating: 4 }];

    const baseProps = {
        eventId: 10,
        user: { userId: 2 },
        setMessage: vi.fn()
    };

    const loadReviews = vi.fn();
    const setError = vi.fn();

    const handleCreateReview = vi.fn();
    const handleUpdateReview = vi.fn();
    const handleDeleteReview = vi.fn();

    /* =============================
       TEST HELPERS
    ============================= */

    const setupMocks = (overrides = {}) => {
        useEventReviewData.mockReturnValue({
            reviews,
            pagination: {
                page: 1,
                pageSize: 4,
                totalPages: 2,
                totalReviews: 5,
                averageRating: 4.2
            },
            error: "",
            setError,
            isLoading: false,
            loadReviews,
            ...overrides.data
        });

        useEventReviewActions.mockReturnValue({
            isSubmitting: false,
            updatingReviewId: null,
            deletingReviewId: null,
            handleCreateReview,
            handleUpdateReview,
            handleDeleteReview,
            ...overrides.actions
        });
    };

    const renderComp = (props = {}) =>
        render(<EventReviewsSection {...baseProps} {...props} />);

    beforeEach(() => {
        vi.clearAllMocks();
        setupMocks();
    });

    /* =========================
       BASIC RENDER
    ========================= */

    it("should render title and subtitle", () => {
        renderComp();

        expect(screen.getByText(/event reviews/i)).toBeInTheDocument();
        expect(screen.getByText(/see what participants shared/i)).toBeInTheDocument();
    });

    it("should render review summary (rating + count)", () => {
        renderComp();

        const summary = screen.getByLabelText("Event review summary");

        expect(summary).toBeInTheDocument();

        expect(summary.textContent).toMatch(/4\.2/);
        expect(summary.textContent).toMatch(/5 reviews/);
    });

    it("should display zero rating when average rating is missing", () => {
        setupMocks({
            data: {
                pagination: {
                    page: 1,
                    pageSize: 4,
                    totalPages: 1,
                    totalReviews: 0,
                    averageRating: null
                }
            }
        });

        renderComp();

        const summary = screen.getByLabelText("Event review summary");

        expect(summary.textContent).toMatch(/0/);
        expect(summary.textContent).toMatch(/0 review/);
    });

    /* =========================
       FORM TOGGLE
    ========================= */

    it("should open and close review form", () => {
        renderComp();

        fireEvent.click(screen.getByText(/write a review/i));
        expect(screen.getByTestId("event-review-form")).toBeInTheDocument();

        fireEvent.click(screen.getByText(/hide review form/i));
        expect(screen.queryByTestId("event-review-form")).not.toBeInTheDocument();
    });

    /* =========================
       CREATE FLOW
    ========================= */

    it("should create review and close form", async () => {
        handleCreateReview.mockResolvedValue();

        renderComp();

        fireEvent.click(screen.getByText(/write a review/i));
        fireEvent.click(screen.getByText(/submit/i));

        expect(handleCreateReview).toHaveBeenCalledWith({
            rating: 5,
            comment: "Great event!"
        });

        await waitFor(() => {
            expect(screen.queryByTestId("event-review-form")).not.toBeInTheDocument();
        });
    });

    /* =========================
       LIST + FORWARDING
    ========================= */

    it("should forward props to list", () => {
        setupMocks({
            actions: {
                updatingReviewId: 1,
                deletingReviewId: 2
            }
        });

        renderComp();

        expect(screen.getByText("updating:1")).toBeInTheDocument();
        expect(screen.getByText("deleting:2")).toBeInTheDocument();
    });

    it("should forward delete action", () => {
        renderComp();

        fireEvent.click(screen.getByText("delete"));

        expect(handleDeleteReview).toHaveBeenCalledWith(1);
    });

    it("should forward update action", () => {
        renderComp();

        fireEvent.click(screen.getByText("edit"));

        expect(handleUpdateReview).toHaveBeenCalledWith(1, {});
    });

    /* =========================
       PAGINATION
    ========================= */

    it("should render pagination controls when there are multiple review pages", () => {
        renderComp();

        expect(screen.getByRole("navigation", {
            name: /event reviews pagination/i
        })).toBeInTheDocument();

        expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument();
    });

    it("should load next review page", () => {
        renderComp();

        fireEvent.click(screen.getByRole("button", {
            name: /next/i
        }));

        expect(loadReviews).toHaveBeenCalledWith(2);
    });

    it("should not render pagination controls when there is only one review page", () => {
        setupMocks({
            data: {
                pagination: {
                    page: 1,
                    pageSize: 4,
                    totalPages: 1,
                    totalReviews: 1,
                    averageRating: 5
                }
            }
        });

        renderComp();

        expect(screen.queryByRole("navigation", {
            name: /event reviews pagination/i
        })).not.toBeInTheDocument();
    });

    /* =========================
       LOAD ON MOUNT
    ========================= */

    it("should call loadReviews on mount", () => {
        renderComp();

        expect(loadReviews).toHaveBeenCalledTimes(1);
    });
});
