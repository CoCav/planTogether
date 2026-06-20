import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

import EventReviewForm from "../../../components/eventReviews/EventReviewForm";

/* ==================================================
   EVENT REVIEW FORM TESTS
   Tests event review form rendering and interactions

   Handles:
   - comment field rendering
   - comment field updates
   - rating field rendering
   - rating selection
   - bottom row rating and submit layout
   - submit action rendering
   - submit loading state
   - form submission
   - form reset after successful submit
   - validation error display
   - accessible validation descriptions
   - accessible invalid field states

   Notes:
   - form state and validation are handled by useEventReviewForm
   - EventReviewRating is tested here through user-facing behavior
================================================== */

describe("EventReviewForm", () => {

    /* =============================
       TEST DATA
    ============================= */

    const defaultProps = {
        onSubmit: vi.fn(),
        isSubmitting: false
    };

    /* =============================
       TEST HELPERS
    ============================= */

    const renderEventReviewForm = (props = {}) => {
        return render(
            <EventReviewForm
                {...defaultProps}
                {...props}
            />
        );
    };

    /* =============================
       FORM FIELDS
    ============================= */

    it("should render comment field", () => {
        renderEventReviewForm();

        expect(screen.getByLabelText(/comment/i)).toBeInTheDocument();

        expect(screen.getByPlaceholderText(
            /what did you think of this event/i
        )).toBeInTheDocument();
    });

    it("should update comment field when typing", () => {
        renderEventReviewForm();

        const textarea = screen.getByLabelText(/comment/i);

        fireEvent.change(textarea, {
            target: {
                name: "comment",
                value: "Great event!"
            }
        });

        expect(textarea).toHaveValue("Great event!");
    });

    it("should render rating field", () => {
        renderEventReviewForm();

        expect(screen.getByText("Rating")).toBeInTheDocument();

        expect(screen.getByRole("radiogroup", {
            name: /rating/i
        })).toBeInTheDocument();
    });

    it("should update rating when selecting a star", () => {
        renderEventReviewForm();

        fireEvent.click(screen.getByRole("radio", {
            name: /4 stars/i
        }));

        expect(screen.getByRole("radio", {
            name: /4 stars/i
        })).toHaveAttribute("aria-checked", "true");
    });

    it("should render rating and submit action in the bottom row", () => {
        renderEventReviewForm();

        const bottomRow = screen.getByText("Rating").closest(".event-review-form-bottom-row");

        expect(bottomRow).toBeInTheDocument();

        expect(within(bottomRow).getByRole("button", {
            name: /submit review/i
        })).toBeInTheDocument();
    });

    /* =============================
       FORM ACTIONS
    ============================= */

    it("should render submit action", () => {
        renderEventReviewForm();

        expect(screen.getByRole("button", {
            name: /submit review/i
        })).toBeInTheDocument();
    });

    it("should disable submit action while submitting", () => {
        renderEventReviewForm({
            isSubmitting: true
        });

        expect(screen.getByRole("button", {
            name: /submitting/i
        })).toBeDisabled();

        expect(screen.getByLabelText(/comment/i)).toBeDisabled();
    });

    it("should call onSubmit when form is valid and submitted", () => {
        const onSubmit = vi.fn();

        renderEventReviewForm({
            onSubmit
        });

        fireEvent.click(screen.getByRole("radio", {
            name: /5 stars/i
        }));

        fireEvent.change(screen.getByLabelText(/comment/i), {
            target: {
                name: "comment",
                value: "Great event!"
            }
        });

        fireEvent.submit(screen.getByRole("button", {
            name: /submit review/i
        }).closest("form"));

        expect(onSubmit).toHaveBeenCalledWith({
            rating: 5,
            comment: "Great event!"
        });
    });

    it("should clear form after successful submit", async () => {
        const onSubmit = vi.fn().mockResolvedValue();

        renderEventReviewForm({ onSubmit });

        const textarea = screen.getByLabelText(/comment/i);

        fireEvent.click(screen.getByRole("radio", {
            name: /5 stars/i
        }));

        fireEvent.change(textarea, {
            target: {
                name: "comment",
                value: "Great event!"
            }
        });

        fireEvent.submit(screen.getByRole("button", {
            name: /submit review/i
        }).closest("form"));

        await waitFor(() => {
            expect(textarea).toHaveValue("");
        });

        expect(screen.getByRole("radio", {
            name: /5 stars/i
        })).toHaveAttribute("aria-checked", "false");
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    it("should display validation error when comment is empty", () => {
        const onSubmit = vi.fn();

        renderEventReviewForm({
            onSubmit
        });

        fireEvent.submit(screen.getByRole("button", {
            name: /submit review/i
        }).closest("form"));

        expect(screen.getByText("Rating is required")).toBeInTheDocument();
        expect(screen.getByText("Comment is required")).toBeInTheDocument();

        expect(onSubmit).not.toHaveBeenCalled();
    });

    it("should display validation error when rating is missing", () => {
        const onSubmit = vi.fn();

        renderEventReviewForm({ onSubmit });

        fireEvent.change(screen.getByLabelText(/comment/i), {
            target: {
                name: "comment",
                value: "Great event!"
            }
        });

        fireEvent.submit(screen.getByRole("button", {
            name: /submit review/i
        }).closest("form"));

        expect(screen.getByText("Rating is required")).toBeInTheDocument();
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it("should display validation error when comment is too short", () => {
        renderEventReviewForm();

        fireEvent.click(screen.getByRole("radio", {
            name: /5 stars/i
        }));

        fireEvent.change(screen.getByLabelText(/comment/i), {
            target: {
                name: "comment",
                value: "bad"
            }
        });

        fireEvent.submit(screen.getByRole("button", {
            name: /submit review/i
        }).closest("form"));

        expect(screen.getByText(/between 5 and 1000 characters/i)).toBeInTheDocument();
    });

    /* =============================
       ACCESSIBILITY
    ============================= */

    it("should associate comment field with validation description", () => {
        renderEventReviewForm();

        fireEvent.submit(screen.getByRole("button", {
            name: /submit review/i
        }).closest("form"));

        expect(screen.getByLabelText(/comment/i)).toHaveAttribute(
            "aria-describedby",
            "review-comment-error"
        );
    });

    it("should mark comment field as invalid when validation fails", () => {
        renderEventReviewForm();

        fireEvent.submit(screen.getByRole("button", {
            name: /submit review/i
        }).closest("form"));

        expect(screen.getByLabelText(/comment/i)).toHaveAttribute(
            "aria-invalid",
            "true"
        );
    });

    it("should associate rating field with validation description", () => {
        renderEventReviewForm();

        fireEvent.submit(screen.getByRole("button", {
            name: /submit review/i
        }).closest("form"));

        expect(screen.getByRole("radiogroup", {
            name: /rating/i
        }).parentElement).toHaveAttribute(
            "aria-describedby",
            "review-rating-error"
        );
    });
});
