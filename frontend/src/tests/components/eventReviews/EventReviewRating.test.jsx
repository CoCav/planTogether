import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import EventReviewRating from "../../../components/eventReviews/EventReviewRating";

/* ==================================================
   EVENT REVIEW RATING TESTS
   Tests event review rating rendering and selection

   Handles:
   - read-only rating rendering
   - interactive rating rendering
   - selected rating state
   - rating change callback
   - disabled rating controls
   - custom accessible label
   - accessible description forwarding
   - disabled radiogroup state

   Notes:
   - rating values range from 1 to 5
   - visual star fill is represented by active icon classes
================================================== */

describe("EventReviewRating", () => {

    /* =============================
       TEST DATA
    ============================= */

    const defaultProps = {
        value: 0,
        onChange: vi.fn(),
        readOnly: false,
        disabled: false,
        label: "Rating"
    };

    /* =============================
       TEST HELPERS
    ============================= */

    const renderEventReviewRating = (props = {}) => {
        return render(
            <EventReviewRating
                {...defaultProps}
                {...props}
            />
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    /* =============================
       READ-ONLY DISPLAY
    ============================= */

    it("should render read-only rating with accessible label", () => {
        renderEventReviewRating({
            value: 4,
            readOnly: true
        });

        expect(screen.getByRole("img", {
            name: "4 out of 5 stars"
        })).toBeInTheDocument();
    });

    it("should not render radio controls in read-only mode", () => {
        renderEventReviewRating({
            value: 4,
            readOnly: true
        });

        expect(screen.queryAllByRole("radio")).toHaveLength(0);
    });

    /* =============================
       INTERACTIVE DISPLAY
    ============================= */

    it("should render interactive rating controls", () => {
        renderEventReviewRating();

        expect(screen.getByRole("radiogroup", {
            name: /rating/i
        })).toBeInTheDocument();

        expect(screen.getAllByRole("radio")).toHaveLength(5);
    });

    it("should mark selected rating as checked", () => {
        renderEventReviewRating({
            value: 3
        });

        expect(screen.getByRole("radio", {
            name: /3 stars/i
        })).toHaveAttribute("aria-checked", "true");
    });

    it("should call onChange with selected rating", () => {
        const onChange = vi.fn();

        renderEventReviewRating({
            onChange
        });

        fireEvent.click(screen.getByRole("radio", {
            name: /5 stars/i
        }));

        expect(onChange).toHaveBeenCalledWith(5);
    });

    it("should disable rating controls when disabled", () => {
        renderEventReviewRating({
            value: 2,
            disabled: true
        });

        screen.getAllByRole("radio").forEach((starButton) => {
            expect(starButton).toBeDisabled();
        });
    });

    it("should mark radiogroup as disabled when disabled", () => {
        renderEventReviewRating({
            disabled: true
        });

        expect(screen.getByRole("radiogroup", {
            name: /rating/i
        })).toHaveAttribute("aria-disabled", "true");
    });

    it("should forward accessible description id", () => {
        renderEventReviewRating({
            describedBy: "rating-error"
        });

        expect(screen.getByRole("radiogroup", {
            name: /rating/i
        })).toHaveAttribute("aria-describedby", "rating-error");
    });

    it("should support custom accessible label", () => {
        renderEventReviewRating({
            label: "Review score"
        });

        expect(screen.getByRole("radiogroup", {
            name: /review score/i
        })).toBeInTheDocument();
    });
});
