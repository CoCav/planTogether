const { body } = require('express-validator');

/* ==================================================
   AUTH VALIDATORS

   Handles:
   - registration validation
   - login validation
   - profile update validation
   - password update validation

   Notes:
   - validateRequest must run after these validators
   - email values are normalized before reaching controllers
================================================== */

/* =============================
   REGISTER / LOGIN
============================= */

// Validate user registration data
const registerValidator = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email')
        .normalizeEmail(),

    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
        .matches(/\d/).withMessage('Password must contain a number')
        .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
        .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
];

// Validate user login data
const loginValidator = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
];


/* =============================
   PROFILE / PASSWORD
============================= */

// Validate profile update data
const updateProfileValidator = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),

    body('email')
        .optional()
        .trim()
        .isEmail().withMessage('Invalid email')
        .normalizeEmail()
];

// Validate password update data
const changePasswordValidator = [
    body("currentPassword")
        .notEmpty().withMessage("Current password is required"),

    body("newPassword")
        .notEmpty().withMessage("New password is required")
        .isLength({ min: 6 }).withMessage("New password must be at least 6 characters long")
        .matches(/\d/).withMessage("New password must contain a number")
        .matches(/[A-Z]/).withMessage("New password must contain an uppercase letter")
        .matches(/[a-z]/).withMessage("New password must contain a lowercase letter")
];

module.exports = { registerValidator, loginValidator, updateProfileValidator, changePasswordValidator };
