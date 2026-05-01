const { body } = require('express-validator');

// Validator for user registration
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
        .matches(/[a-z]/).withMessage('Password must contain a lowercase letter'),

    body('avatarUrl')
        .optional({ checkFalsy: true })
        .isURL().withMessage('Avatar URL must be valid')
];

// Validator for user login
const loginValidator = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required'),
];

// Validator for updating user profile
const updateProfileValidator = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),

    body('email')
        .optional()
        .trim()
        .isEmail().withMessage('Invalid email')
        .normalizeEmail(),

    body('avatarUrl')
        .optional({ checkFalsy: true })
        .isURL().withMessage('Avatar URL must be valid')
];

const changePasswordValidator = [
    body("currentPassword")
        .notEmpty()
        .withMessage("Current password is required"),

    body("newPassword")
        .notEmpty()
        .withMessage("New password is required")
        .isLength({ min: 6 })
        .withMessage("New password must be at least 6 characters long")
        .matches(/\d/).withMessage("New password must contain a number")
        .matches(/[A-Z]/).withMessage("New password must contain an uppercase letter")
        .matches(/[a-z]/).withMessage("New password must contain a lowercase letter"),
];

module.exports = { registerValidator, loginValidator, updateProfileValidator, changePasswordValidator };
