const { throwHttpError } = require("../errors/httpError");

/* ==========================================================================
   Event Review Queries

   Provides reusable event review database query helpers.

   Responsibilities
   - Find event reviews by ID
   - Throw consistent not found errors

   Notes
   - The EventReview model is injected to keep helpers reusable.
   - Additional Sequelize options can be passed through the options parameter.
=========================================================================== */

/* =============================
   REVIEW ERRORS
============================= */

const REVIEW_NOT_FOUND_ERROR = "Review not found";

/* =============================
   REVIEW QUERIES
============================= */

// Find a review by ID or throw a not found error
const findReviewByIdOrFail = async (EventReview, reviewId, options = {}) => {
    const review = await EventReview.findByPk(reviewId, options);

    if (!review) {
        throwHttpError(404, REVIEW_NOT_FOUND_ERROR);
    }

    return review;
};

module.exports = {
    findReviewByIdOrFail
};
