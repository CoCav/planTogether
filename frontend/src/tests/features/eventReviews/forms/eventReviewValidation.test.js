import { describe, expect, it } from "vitest";

import { validateEventReview } from "../../../../features/eventReviews/forms/eventReviewValidation";

/* ==================================================
   EVENT REVIEW VALIDATION TESTS
   Tests event review form validation

   Handles:
   - valid review comments
   - required comment validation
   - trimmed comment validation
   - minimum comment length validation
   - maximum comment length validation
   - missing form value fallback

   Notes:
   - aligned with backend eventReviewValidator
   - rating validation will be added later
================================================== */

describe("eventReviewValidation", () => {

    /* =============================
       VALID COMMENT
    ============================= */

    it("should return no errors for a valid comment", () => {
        expect(validateEventReview({
            comment: "Great event!"
        })).toEqual({});
    });

    it("should trim comment before validating", () => {
        expect(validateEventReview({
            comment: "   Great event!   "
        })).toEqual({});
    });

    /* =============================
       REQUIRED COMMENT
    ============================= */

    it("should require comment", () => {
        const errors = validateEventReview({
            comment: ""
        });

        expect(errors.comment).toBe("Comment is required");
    });

    it("should require comment when value only contains spaces", () => {
        const errors = validateEventReview({
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
            comment: null
        });

        expect(errors.comment).toBe("Comment is required");
    });

    /* =============================
       COMMENT LENGTH
    ============================= */

    it("should reject comment shorter than 5 characters", () => {
        const errors = validateEventReview({
            comment: "abcd"
        });

        expect(errors.comment).toBe("Comment must be between 5 and 1000 characters");
    });

    it("should allow comment with exactly 5 characters", () => {
        expect(validateEventReview({
            comment: "abcde"
        })).toEqual({});
    });

    it("should allow comment with exactly 1000 characters", () => {
        expect(validateEventReview({
            comment: "a".repeat(1000)
        })).toEqual({});
    });

    it("should reject comment longer than 1000 characters", () => {
        const errors = validateEventReview({
            comment: "a".repeat(1001)
        });

        expect(errors.comment).toBe("Comment must be between 5 and 1000 characters");
    });
});
