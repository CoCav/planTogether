const { param } = require("express-validator");

/* ==========================================================================
   Shared Param Validators

   Provides reusable route parameter validators.

   Responsibilities
   - Validate event ID params
   - Validate user ID params
   - Validate review ID params

   Notes
   - Validators only validate parameter shape.
   - Entity existence is handled by services.
=========================================================================== */

/* =============================
   PARAMETER OPTIONS
============================= */

const POSITIVE_INTEGER_ID_OPTIONS = {
    min: 1
};

/* =============================
   PARAMETER VALIDATOR FACTORY
============================= */

// Build a positive integer route parameter validator
const createPositiveIntegerParamValidator = (paramName, message) => [
    param(paramName)
        .isInt(POSITIVE_INTEGER_ID_OPTIONS)
        .withMessage(message)
        .toInt()
];

/* =============================
   IDENTIFIER VALIDATORS
============================= */

const eventIdParamValidator = createPositiveIntegerParamValidator("eventId", "Event ID must be a positive integer");
const userIdParamValidator = createPositiveIntegerParamValidator("userId", "User ID must be a positive integer");
const publicUserIdParamValidator = createPositiveIntegerParamValidator("id", "User ID must be a positive integer");
const reviewIdParamValidator = createPositiveIntegerParamValidator("reviewId", "Review ID must be a positive integer");

module.exports = {
    createPositiveIntegerParamValidator,
    eventIdParamValidator,
    userIdParamValidator,
    publicUserIdParamValidator,
    reviewIdParamValidator
};
