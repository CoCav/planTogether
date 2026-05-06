const { body } = require('express-validator');

/* ==================================================
   AUTH VALIDATORS

   Handles:
   - registration validation
   - login validation

   Notes:
   - validateRequest must run after these validators
   - email values are normalized before reaching controllers
   - user profile/password validators belong to userValidator
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

module.exports = { registerValidator, loginValidator };
