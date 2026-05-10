/* ==================================================
   PASSWORD POLICY

   Handles:
   - shared password validation rules
   - password security requirements
   - reusable validation messages

   Notes:
   - shared across auth and user validators
   - keeps password requirements centralized
================================================== */

const PASSWORD_MIN_LENGTH = 8;

const PASSWORD_REQUIREMENTS = {
    minLength: PASSWORD_MIN_LENGTH,
    hasNumber: /\d/,
    hasUppercase: /[A-Z]/,
    hasLowercase: /[a-z]/
};

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
