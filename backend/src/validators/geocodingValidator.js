const { query } = require("express-validator");

/* ==========================================================================
   Geocoding Validators

   Validates geocoding request query parameters.

   Responsibilities
   - Validate location search queries

   Notes
   - handleValidationErrors must run after these validators.
   - Search queries support autocomplete and geocoding requests.
=========================================================================== */

const searchLocationsValidator = [
    query("q")
        .trim()
        .notEmpty()
        .withMessage("Location query is required")
        .isLength({ min: 2, max: 200 })
        .withMessage("Location query must be between 2 and 200 characters")
];

module.exports = {
    searchLocationsValidator
};
