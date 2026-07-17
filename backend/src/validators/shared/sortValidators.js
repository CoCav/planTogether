const { query } = require("express-validator");

/* ==========================================================================
   Shared Sort Validators

   Provides reusable sorting query validators.

   Responsibilities
   - Validate sort direction
   - Build sort field validators from allowed fields

   Notes
   - Sort fields stay route-specific through createSortByValidator.
=========================================================================== */

/* =============================
   SORT CONSTANTS
============================= */

const VALID_SORT_ORDERS = [
    "asc",
    "desc"
];

/* =============================
   SORT VALIDATORS
============================= */

// Validate and normalize the requested sort direction
const orderQueryValidator = query("order")
    .optional()
    .toLowerCase()
    .isIn(VALID_SORT_ORDERS)
    .withMessage("Order must be asc or desc");

// Build a sort field validator from an allowlist
const createSortByValidator = (allowedFields, message = "Invalid sort field") => {
    return query("sortBy")
        .optional()
        .isIn(allowedFields)
        .withMessage(message);
};

module.exports = {
    orderQueryValidator,
    createSortByValidator
};
