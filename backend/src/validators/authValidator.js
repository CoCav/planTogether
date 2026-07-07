const { body } = require("express-validator");

const { PASSWORD_REQUIREMENTS, PASSWORD_MESSAGES } = require("../config/security/passwordPolicy");

/* ==========================================================================
   Auth Validators

   Validates authentication request payloads.

   Responsibilities
   - Validate user registration
   - Validate user login
   - Normalize email addresses

   Notes
   - handleValidationErrors must run after these validators.
   - Password rules are centralized in passwordPolicy.
   - User profile and password update validators belong to user validators.
=========================================================================== */

/* Registration */

const registerValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required"),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email")
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

/* Login */

const loginValidator = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email")
        .normalizeEmail(),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
];

module.exports = {
    registerValidator,
    loginValidator
};
