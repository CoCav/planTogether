const { param } = require("express-validator");

/* ==================================================
   USER VALIDATORS

   Handles:
   - public user profile params
   - public user events params

   Notes:
   - validateRequest must run after this validator
   - user ID is used for lookup but not exposed in response
================================================== */

// Validate public user ID route param
const userIdParamValidator = [
    param("id")
        .isInt({ min: 1 }).withMessage("User ID must be a positive integer")
        .toInt()
];

module.exports = { userIdParamValidator };
