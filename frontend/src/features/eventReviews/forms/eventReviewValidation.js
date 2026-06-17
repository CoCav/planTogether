/* ==================================================
   EVENT REVIEW VALIDATION
   Provides frontend validation for event review forms

   Handles:
   - required review comment
   - comment length validation

   Notes:
   - aligned with backend eventReviewValidator
   - rating validation will be added later
================================================== */

/* =============================
   REVIEW FORM VALIDATION
============================= */

// Validates event review form values
export const validateEventReview = ({ comment } = {}) => {
    const errors = {};

    const cleanComment = String(comment ?? "").trim();

    if (!cleanComment) {
        errors.comment = "Comment is required";
        return errors;
    }

    if (cleanComment.length < 5 || cleanComment.length > 1000) {
        errors.comment = "Comment must be between 5 and 1000 characters";
    }

    return errors;
};
