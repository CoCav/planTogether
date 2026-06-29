const { param } = require("express-validator");

/* ==================================================
   EVENT LIKE VALIDATORS

   Handles:
   - event ID param validation for like actions

   Notes:
   - handleValidationErrors must run after these validators
   - authentication is handled separately by route middleware
   - event existence is handled by the service layer
================================================== */

/* =============================
   LIKE PARAMS
============================= */

// Validate event ID route param
const eventIdParamValidator = [
    param("eventId")
        .isInt({ min: 1 })
        .withMessage("Event ID must be a positive integer")
        .toInt()
];

module.exports = {
    eventIdParamValidator
};
