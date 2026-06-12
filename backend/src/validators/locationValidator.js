const { query } = require("express-validator");

/* ==================================================
   LOCATION VALIDATORS

   Handles:
   - location search query validation

   Notes:
   - handleValidationErrors must run after these validators
   - search query supports future autocomplete usage
================================================== */

/* =============================
   LOCATION SEARCH
============================= */

// Validate location search query
const searchLocationValidator = [
    query("q")
        .trim()
        .notEmpty().withMessage("Location query is required")
        .isLength({ min: 2, max: 200 })
        .withMessage("Location query must be between 2 and 200 characters")
];

module.exports = { searchLocationValidator };
