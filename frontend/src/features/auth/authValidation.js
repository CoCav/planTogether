import { PASSWORD_REQUIREMENTS, PASSWORD_MESSAGES } from "../shared/security/passwordPolicy";
import { validateAvatarFile } from "../shared/security/uploadPolicy";

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

// Validates password strength rules and returns a single user-friendly string
const validatePasswordRules = (password) => {
    const errors = [];

    if (password.length < PASSWORD_REQUIREMENTS.minLength) {
        errors.push(PASSWORD_MESSAGES.minLength);
    }
    if (!PASSWORD_REQUIREMENTS.hasNumber.test(password)) {
        errors.push(PASSWORD_MESSAGES.number);
    }
    if (!PASSWORD_REQUIREMENTS.hasUppercase.test(password)) {
        errors.push(PASSWORD_MESSAGES.uppercase);
    }
    if (!PASSWORD_REQUIREMENTS.hasLowercase.test(password)) {
        errors.push(PASSWORD_MESSAGES.lowercase);
    }

    if (errors.length === 0) return null;

    // Concatenate into a readable sentence
    return `Password must ${errors.join(", ")}.`;
};

/* =============================
   REGISTER / LOGIN
============================= */

// Validates register form data including confirm password
export const validateRegisterForm = ({ name, email, password, confirmPassword, avatar }) => {
    const errors = {};

    if (!name?.trim()) {
        errors.name = "Name is required";
    }

    if (!email?.trim()) {
        errors.email = "Email is required";
    } else if (!isValidEmail(email)) {
        errors.email = "Invalid email";
    }

    if (!password) {
        errors.password = "Password is required";
    } else {
        const passwordErrorMessage = validatePasswordRules(password);
        if (passwordErrorMessage) {
            errors.password = passwordErrorMessage;
        }
    }

    if (confirmPassword !== undefined) {
        if (!confirmPassword) {
            errors.confirmPassword = "Please confirm your password";
        } else if (confirmPassword !== password) {
            errors.confirmPassword = "Passwords do not match";
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

    if (!email?.trim()) {
        errors.email = "Email is required";
    } else if (!isValidEmail(email)) {
        errors.email = "Invalid email";
    }

    if (!password) {
        errors.password = "Password is required";
    }

    return errors;
};
