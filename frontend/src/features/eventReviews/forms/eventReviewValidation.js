/* ==================================================
   EVENT REVIEW VALIDATION
   Provides frontend validation for event review forms

   Handles:
   - required review rating
   - rating range validation
   - required review comment
   - comment length validation

   Notes:
   - aligned with backend eventReviewValidator
   - rating values range from 1 to 5
================================================== */

/* =============================
   REVIEW FORM VALIDATION
============================= */

// Validates event review form values before submission
export const validateEventReview = ({ rating, comment } = {}) => {
    const errors = {};

    const numericRating = Number(rating);
    const cleanComment = String(comment ?? "").trim();

    // Rating is required and must match backend limits
    if (rating === "" || rating === null || rating === undefined) {
        errors.rating = "Rating is required";
    } else if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
        errors.rating = "Rating must be an integer between 1 and 5";
    }

    // Comment is required
    if (!cleanComment) {
        errors.comment = "Comment is required";
        return errors;
    }

    // Comment length must match backend validation
    if (cleanComment.length < 5 || cleanComment.length > 1000) {
        errors.comment = "Comment must be between 5 and 1000 characters";
    }

    return errors;
};
