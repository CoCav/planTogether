/* ==========================================================================
   Event Review Utilities

   Builds review includes and review stats helpers.

   Responsibilities
   - Build event review includes
   - Build review count attributes
   - Build average rating attributes

   Notes
   - Review count attributes use COUNT DISTINCT to avoid duplicate counts.
   - Average rating is rounded to one decimal.
=========================================================================== */

/* =============================
   REVIEW CONSTANTS
============================= */

const REVIEW_COUNT_ALIAS = "reviewCount";
const AVERAGE_RATING_ALIAS = "averageRating";

/* =============================
   REVIEW QUERY BUILDERS
============================= */

// Build a Sequelize include for event reviews
const buildEventReviewInclude = (EventReview) => ({
    model: EventReview,
    as: "reviews",
    attributes: [],
    required: false
});


// Build a distinct event review count attribute
const buildEventReviewCountAttribute = (sequelize, reviewIdPath) => ([
    sequelize.fn(
        "COUNT",
        sequelize.fn("DISTINCT", sequelize.col(reviewIdPath))
    ),
    REVIEW_COUNT_ALIAS
]);

// Build an average rating attribute rounded to one decimal
const buildEventAverageRatingAttribute = (sequelize, ratingPath) => ([
    sequelize.fn(
        "ROUND",
        sequelize.cast(sequelize.fn("AVG", sequelize.col(ratingPath)), "numeric"),
        1
    ),
    AVERAGE_RATING_ALIAS
]);

module.exports = {
    buildEventReviewInclude,
    buildEventReviewCountAttribute,
    buildEventAverageRatingAttribute
};
