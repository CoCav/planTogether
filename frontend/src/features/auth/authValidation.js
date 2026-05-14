import { PASSWORD_REQUIREMENTS, PASSWORD_MESSAGES } from "./passwordPolicy";

/* ==================================================
   AUTH VALIDATION
   Provides frontend validation helpers for auth forms

   Covers:
   - register form
   - login form

   Notes:
   - profile and password validation belong to userValidation
   - rules are aligned with backend authValidator
================================================== */

/* =============================
   SHARED HELPERS
============================= */

// Checks if an email has a valid format
const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

// Validates password strength rules
const validatePasswordRules = (password) => {
    const errors = [];

    if (password.length < 6) {
        errors.push("At least 6 characters");
    }

    if (!/\d/.test(password)) {
        errors.push("At least 1 number");
    }

    if (!/[A-Z]/.test(password)) {
        errors.push("At least 1 uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
        errors.push("At least 1 lowercase letter");
    }

    return errors;
};

// Validates avatar file constraints
const validateAvatarFile = (avatar) => {
    if (!avatar) return null;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const maxSize = 2 * 1024 * 1024;

    if (!allowedTypes.includes(avatar.type)) {
        return "Avatar must be an image file";
    }

    if (avatar.size > maxSize) {
        return "Avatar must be less than 2MB";
    }

    return null;
};

/* =============================
   REGISTER / LOGIN
============================= */

// Validates register form data
export const validateRegisterForm = ({ name, email, password, avatar }) => {
    const errors = {};

    if (!name.trim()) {
        errors.name = "Name is required";
    }

    if (!email.trim()) {
        errors.email = "Email is required";
    } else if (!isValidEmail(email)) {
        errors.email = "Invalid email";
    }

    if (!password) {
        errors.password = "Password is required";
    } else {
        const passwordErrors = validatePasswordRules(password);

        if (passwordErrors.length > 0) {
            errors.password = passwordErrors;
        }
    }

    const avatarError = validateAvatarFile(avatar);

    if (avatarError) {
        errors.avatar = avatarError;
    }

    return errors;
};

// Validates login form data
export const validateLoginForm = ({ email, password }) => {
    const errors = {};

    if (!email.trim()) {
        errors.email = "Email is required";
    } else if (!isValidEmail(email)) {
        errors.email = "Invalid email";
    }

    if (!password) {
        errors.password = "Password is required";
    }

    return errors;
};
