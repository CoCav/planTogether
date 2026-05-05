const { param } = require("express-validator");

/* ==================================================
   USER VALIDATORS

   Handles:
   - public user profile params
   - public user events params
================================================== */

// Validator for public user ID params
const userIdParamValidator = [
    param("id")
        .isInt({ min: 1 }).withMessage("User ID must be a positive integer")
        .toInt()
];

module.exports = { userIdParamValidator };
