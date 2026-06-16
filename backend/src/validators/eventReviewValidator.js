const { body, param } = require("express-validator");

/* ==================================================
   EVENT REVIEW VALIDATORS

   Handles:
   - event ID param validation
   - review ID param validation
   - event review creation validation

   Notes:
   - handleValidationErrors must run after these validators
   - review permissions are handled separately by services/controllers
   - rating validation will be added later with the rating milestone
================================================== */

/* =============================
   REVIEW PARAMS
============================= */

// Validate event ID route param
const eventIdParamValidator = [
    param("eventId")
        .isInt({ min: 1 })
        .withMessage("Event ID must be a positive integer")
        .toInt()
];

// Validate review ID route param
const reviewIdParamValidator = [
    param("reviewId")
        .isInt({ min: 1 })
        .withMessage("Review ID must be a positive integer")
        .toInt()
];

/* =============================
   REVIEW PAYLOAD
============================= */

// Validate event review creation payload
const createReviewValidator = [
    body("comment")
        .trim()
        .notEmpty()
        .withMessage("Comment is required")
        .bail()
        .isLength({ min: 5, max: 1000 })
        .withMessage("Comment must be between 5 and 1000 characters")
];

module.exports = {
    eventIdParamValidator,
    reviewIdParamValidator,
    createReviewValidator
};
