/* ==========================================================================
   Password Policy

   Defines shared password validation rules.

   Responsibilities
   - Define password security requirements
   - Centralize password validation messages
   - Share password rules across auth and user validators

   Notes
   - Keep these rules synchronized with frontend password validation.
=========================================================================== */

/* =============================
   PASSWORD REQUIREMENTS
============================= */

// Minimum password length required by the application
const PASSWORD_MIN_LENGTH = 8;

// Shared password validation rules
const PASSWORD_REQUIREMENTS = {
    minLength: PASSWORD_MIN_LENGTH,
    hasNumber: /\d/,
    hasUppercase: /[A-Z]/,
    hasLowercase: /[a-z]/
};

/* =============================
   PASSWORD MESSAGES
============================= */

// Shared validation messages used by password validators
const PASSWORD_MESSAGES = {
    minLength:
        `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,

    number:
        "Password must contain a number",

    uppercase:
        "Password must contain an uppercase letter",

    lowercase:
        "Password must contain a lowercase letter",

    newPasswordMinLength:
        `New password must be at least ${PASSWORD_MIN_LENGTH} characters long`,

    newPasswordNumber:
        "New password must contain a number",

    newPasswordUppercase:
        "New password must contain an uppercase letter",

    newPasswordLowercase:
        "New password must contain a lowercase letter"
};

module.exports = { PASSWORD_MIN_LENGTH, PASSWORD_REQUIREMENTS, PASSWORD_MESSAGES };
