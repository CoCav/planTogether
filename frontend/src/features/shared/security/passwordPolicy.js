/* ==================================================
   PASSWORD POLICY
   Centralizes shared password validation rules

   Notes:
   - mirrors backend password policy configuration
   - used by auth validation, user password forms and UI helpers
================================================== */

export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_REQUIREMENTS = {
    minLength: PASSWORD_MIN_LENGTH,
    hasNumber: /\d/,
    hasUppercase: /[A-Z]/,
    hasLowercase: /[a-z]/
};

/* ==================================================
   PASSWORD MESSAGES
   Validation messages for password forms
================================================== */

export const PASSWORD_MESSAGES = {
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

/* ==================================================
   PASSWORD REQUIREMENT LABELS
   Short display labels for live password requirements
================================================== */

export const PASSWORD_REQUIREMENT_LABELS = {
    minLength: `${PASSWORD_MIN_LENGTH} characters`,
    uppercase: "1 uppercase",
    lowercase: "1 lowercase",
    number: "1 number"
};
