import { PASSWORD_REQUIREMENTS, PASSWORD_MESSAGES } from "../auth/passwordPolicy";

/* ==================================================
   USER VALIDATION
   Provides frontend validation helpers for user forms

   Covers:
   - current user profile update
   - current user password update

   Notes:
   - rules are aligned with backend userValidator
   - profile fields are optional on the backend, but validated when present
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
        errors.push("New password must be at least 6 characters");
    }

    if (!/\d/.test(password)) {
        errors.push("New password must contain at least 1 number");
    }

    if (!/[A-Z]/.test(password)) {
        errors.push("New password must contain at least 1 uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
        errors.push("New password must contain at least 1 lowercase letter");
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
   PROFILE
============================= */

// Validates current user profile form data
export const validateProfileForm = ({ name, email, avatar }) => {
    const errors = {};

    if (name !== undefined && !name.trim()) {
        errors.name = "Name is required";
    } else if (name !== undefined && name.trim().length < 2) {
        errors.name = "Name must be at least 2 characters long";
    }

    if (email !== undefined && !email.trim()) {
        errors.email = "Email is required";
    } else if (email !== undefined && !isValidEmail(email)) {
        errors.email = "Invalid email";
    }

    const avatarError = validateAvatarFile(avatar);

    if (avatarError) {
        errors.avatar = avatarError;
    }

    return errors;
};

/* =============================
   PASSWORD
============================= */

// Validates current user password change form data
export const validateChangePasswordForm = ({ currentPassword, newPassword, confirmPassword }) => {
    const errors = {};

    if (!currentPassword) {
        errors.currentPassword = "Current password is required";
    }

    if (!newPassword) {
        errors.newPassword = "New password is required";
    } else {
        const passwordErrors = validatePasswordRules(newPassword);

        if (currentPassword && currentPassword === newPassword) {
            passwordErrors.push(
                "New password must be different from current password"
            );
        }

        if (passwordErrors.length > 0) {
            errors.newPassword = passwordErrors;
        }
    }

    if (!confirmPassword) {
        errors.confirmPassword = "Confirm password is required";
    } else if (newPassword && confirmPassword !== newPassword) {
        errors.confirmPassword = "Passwords do not match. Please check again.";
    }

    return errors;
};
