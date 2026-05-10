const { body } = require("express-validator");

const { PASSWORD_REQUIREMENTS, PASSWORD_MESSAGES } = require("../config/security/passwordPolicy");

/* ==================================================
   AUTH VALIDATORS

   Handles:
   - registration validation
   - login validation

   Notes:
   - handleValidationErrors must run after these validators
   - email values are normalized before reaching controllers
   - password rules are centralized in utils/auth/passwordRules
   - user profile/password validators belong to userValidator
================================================== */

/* =============================
   REGISTER / LOGIN
============================= */

// Validate user registration data
const registerValidator = [
    body("name")
        .trim()
        .notEmpty().withMessage("Name is required"),

    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email")
        .normalizeEmail(),

    body("password")
        .isLength({ min: PASSWORD_REQUIREMENTS.minLength })
        .withMessage(PASSWORD_MESSAGES.minLength)
        .matches(PASSWORD_REQUIREMENTS.hasNumber)
        .withMessage(PASSWORD_MESSAGES.number)
        .matches(PASSWORD_REQUIREMENTS.hasUppercase)
        .withMessage(PASSWORD_MESSAGES.uppercase)
        .matches(PASSWORD_REQUIREMENTS.hasLowercase)
        .withMessage(PASSWORD_MESSAGES.lowercase)
];

// Validate user login data
const loginValidator = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email")
        .normalizeEmail(),

    body("password")
        .notEmpty().withMessage("Password is required")
];

module.exports = { registerValidator, loginValidator };
