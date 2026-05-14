/* ==================================================
   PASSWORD POLICY
   Centralizes frontend password validation rules

   Mirrors backend password policy configuration
================================================== */

export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_REQUIREMENTS = {
    minLength: PASSWORD_MIN_LENGTH,
    hasNumber: /\d/,
    hasUppercase: /[A-Z]/,
    hasLowercase: /[a-z]/
};

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
