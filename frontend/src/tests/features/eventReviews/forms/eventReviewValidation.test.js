import { describe, expect, it } from "vitest";

import { validateEventReview } from "../../../../features/eventReviews/forms/eventReviewValidation";

/* ==================================================
   EVENT REVIEW VALIDATION TESTS
   Tests event review form validation

   Handles:
   - valid review rating and comment
   - required rating validation
   - rating range validation
   - required comment validation
   - trimmed comment validation
   - minimum comment length validation
   - maximum comment length validation
   - missing form value fallback

   Notes:
   - aligned with backend eventReviewValidator
   - rating values range from 1 to 5
================================================== */

describe("eventReviewValidation", () => {

    /* =============================
       TEST DATA
    ============================= */

    const validReview = {
        rating: 5,
        comment: "Great event!"
    };

    /* =============================
       VALID REVIEW
    ============================= */

    it("should return no errors for a valid review", () => {
        expect(validateEventReview(validReview)).toEqual({});
    });

    it("should trim comment before validating", () => {
        expect(validateEventReview({
            rating: 5,
            comment: "   Great event!   "
        })).toEqual({});
    });

    /* =============================
       RATING
    ============================= */

    it("should require rating", () => {
        const errors = validateEventReview({
            comment: "Great event!"
        });

        expect(errors.rating).toBe("Rating is required");
    });

    it("should reject rating lower than 1", () => {
        const errors = validateEventReview({
            ...validReview,
            rating: -1
        });

        expect(errors.rating).toBe("Rating must be an integer between 1 and 5");
    });

    it("should reject rating higher than 5", () => {
        const errors = validateEventReview({
            ...validReview,
            rating: 6
        });

        expect(errors.rating).toBe("Rating must be an integer between 1 and 5");
    });

    it("should reject non-integer rating", () => {
        const errors = validateEventReview({
            ...validReview,
            rating: "bad"
        });

        expect(errors.rating).toBe("Rating must be an integer between 1 and 5");
    });

    it("should allow rating as numeric string", () => {
        expect(validateEventReview({
            ...validReview,
            rating: "5"
        })).toEqual({});
    });

    /* =============================
       REQUIRED COMMENT
    ============================= */

    it("should require comment", () => {
        const errors = validateEventReview({
            rating: 5,
            comment: ""
        });

        expect(errors.comment).toBe("Comment is required");
    });

    it("should require comment when value only contains spaces", () => {
        const errors = validateEventReview({
            rating: 5,
            comment: "   "
        });

        expect(errors.comment).toBe("Comment is required");
    });

    it("should require comment when values are missing", () => {
        const errors = validateEventReview();

        expect(errors.comment).toBe("Comment is required");
    });

    it("should require comment when comment is null", () => {
        const errors = validateEventReview({
            rating: 5,
            comment: null
        });

        expect(errors.comment).toBe("Comment is required");
    });

    /* =============================
       COMMENT LENGTH
    ============================= */

    it("should reject comment shorter than 5 characters", () => {
        const errors = validateEventReview({
            rating: 5,
            comment: "abcd"
        });

        expect(errors.comment).toBe("Comment must be between 5 and 1000 characters");
    });

    it("should allow comment with exactly 5 characters", () => {
        expect(validateEventReview({
            rating: 5,
            comment: "abcde"
        })).toEqual({});
    });

    it("should allow comment with exactly 1000 characters", () => {
        expect(validateEventReview({
            rating: 5,
            comment: "a".repeat(1000)
        })).toEqual({});
    });

    it("should reject comment longer than 1000 characters", () => {
        const errors = validateEventReview({
            rating: 5,
            comment: "a".repeat(1001)
        });

        expect(errors.comment).toBe("Comment must be between 5 and 1000 characters");
    });
});
