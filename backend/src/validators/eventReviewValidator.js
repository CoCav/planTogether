const { body } = require("express-validator");

const { eventIdParamValidator, reviewIdParamValidator } = require("./shared/paramsValidators");
const { pageQueryValidator, pageSizeQueryValidator } = require("./shared/paginationValidators");
const { orderQueryValidator, createSortByValidator } = require("./shared/sortValidators");

/* ==========================================================================
   Event Review Validators

   Validates event review requests.

   Responsibilities
   - Validate review listing query params
   - Validate review creation payloads
   - Validate review update payloads
   - Validate event and review identifiers

   Notes
   - handleValidationErrors must run after these validators.
   - Review permissions are handled by the service layer.
=========================================================================== */

const REVIEW_SORT_FIELDS = ["createdAt", "rating"];

/* Review payload */

const createReviewValidator = [
    body("rating")
        .notEmpty()
        .withMessage("Rating is required")
        .bail()
        .isInt({ min: 1, max: 5 })
        .withMessage("Rating must be an integer between 1 and 5")
        .toInt(),

    body("comment")
        .trim()
        .notEmpty()
        .withMessage("Comment is required")
        .bail()
        .isLength({ min: 5, max: 1000 })
        .withMessage("Comment must be between 5 and 1000 characters")
];

const updateReviewValidator = createReviewValidator;

/* Review query */

const getEventReviewsValidator = [
    createSortByValidator(REVIEW_SORT_FIELDS),
    pageQueryValidator,
    pageSizeQueryValidator,
    orderQueryValidator
];

module.exports = {
    eventIdParamValidator,
    reviewIdParamValidator,
    getEventReviewsValidator,
    createReviewValidator,
    updateReviewValidator
};
