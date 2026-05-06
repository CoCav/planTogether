const { body, param } = require("express-validator");

/* ==================================================
   USER VALIDATORS

   Handles:
   - authenticated profile update data
   - authenticated password update data
   - public user profile params
   - public user events params

   Notes:
   - validateRequest must run after these validators
   - /me routes use JWT userId and do not need id param validation
   - /:id routes validate public user ID params
================================================== */

/* =============================
   AUTHENTICATED USER
============================= */

// Validate authenticated profile update data
const updateCurrentUserProfileValidator = [
    body("name")
        .optional()
        .trim()
        .isLength({ min: 2 }).withMessage("Name must be at least 2 characters long"),

    body("email")
        .optional()
        .trim()
        .isEmail().withMessage("Invalid email")
        .normalizeEmail()
];

// Validate authenticated password update data
const changeCurrentUserPasswordValidator = [
    body("currentPassword")
        .notEmpty().withMessage("Current password is required"),

    body("newPassword")
        .notEmpty().withMessage("New password is required")
        .isLength({ min: 6 }).withMessage("New password must be at least 6 characters long")
        .matches(/\d/).withMessage("New password must contain a number")
        .matches(/[A-Z]/).withMessage("New password must contain an uppercase letter")
        .matches(/[a-z]/).withMessage("New password must contain a lowercase letter")
];


/* =============================
   PUBLIC USER
============================= */

// Validate public user ID route param
const userIdParamValidator = [
    param("id")
        .isInt({ min: 1 }).withMessage("User ID must be a positive integer")
        .toInt()
];

module.exports = { updateCurrentUserProfileValidator, changeCurrentUserPasswordValidator, userIdParamValidator };
