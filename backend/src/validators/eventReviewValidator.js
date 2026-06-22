const { body, param, query } = require("express-validator");

/* ==================================================
   EVENT REVIEW VALIDATORS

   Handles:
   - event ID param validation
   - review ID param validation
   - review creation rating validation
   - review creation comment validation
   - review update rating validation
   - review update comment validation

   Notes:
   - handleValidationErrors must run after these validators
   - review permissions are handled separately by services/controllers
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

/* =============================
   REVIEW QUERY
============================= */

// Validate event review listing query params
const getEventReviewsValidator = [
    query("sortBy")
        .optional()
        .isIn(["createdAt", "rating"])
        .withMessage("Invalid sort field"),

    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer"),

    query("pageSize")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Page size must be between 1 and 100"),

    query("order")
        .optional()
        .isIn(["asc", "desc"])
        .withMessage("Order must be asc or desc")
];

// Validate event review update payload
const updateReviewValidator = [

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

module.exports = {
    eventIdParamValidator,
    reviewIdParamValidator,
    getEventReviewsValidator,
    createReviewValidator,
    updateReviewValidator
};
