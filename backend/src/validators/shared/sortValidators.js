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

const VALID_SORT_ORDERS = ["asc", "desc"];

const orderQueryValidator = query("order")
    .optional()
    .toLowerCase()
    .isIn(VALID_SORT_ORDERS)
    .withMessage("Order must be asc or desc");

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
