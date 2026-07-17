const { query } = require("express-validator");

/* ==========================================================================
   Shared Pagination Validators

   Provides reusable pagination query validators.

   Responsibilities
   - Validate page query params
   - Validate page size query params

   Notes
   - Pagination values are converted to integers after validation.
=========================================================================== */

/* =============================
   PAGINATION BOUNDS
============================= */

const MIN_PAGE = 1;
const MIN_PAGE_SIZE = 1;
const MAX_PAGE_SIZE = 100;

/* =============================
   PAGINATION VALIDATORS
============================= */

// Validate and normalize the requested page
const pageQueryValidator = query("page")
    .optional()
    .isInt({ min: MIN_PAGE })
    .withMessage("Page must be a positive integer")
    .toInt();

// Validate and normalize the requested page size
const pageSizeQueryValidator = query("pageSize")
    .optional()
    .isInt({
        min: MIN_PAGE_SIZE,
        max: MAX_PAGE_SIZE
    })
    .withMessage("Page size must be between 1 and 100")
    .toInt();

module.exports = {
    pageQueryValidator,
    pageSizeQueryValidator
};
