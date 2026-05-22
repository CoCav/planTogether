import { PASSWORD_REQUIREMENTS, PASSWORD_MESSAGES } from "../shared/security/passwordPolicy";

import { validateAvatarFile } from "../shared/security/uploadPolicy";

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

// Validates new password strength rules
const validateNewPasswordRules = (password) => {
    const errors = [];

    if (password.length < PASSWORD_REQUIREMENTS.minLength) {
        errors.push(PASSWORD_MESSAGES.newPasswordMinLength);
    }

    if (!PASSWORD_REQUIREMENTS.hasNumber.test(password)) {
        errors.push(PASSWORD_MESSAGES.newPasswordNumber);
    }

    if (!PASSWORD_REQUIREMENTS.hasUppercase.test(password)) {
        errors.push(PASSWORD_MESSAGES.newPasswordUppercase);
    }

    if (!PASSWORD_REQUIREMENTS.hasLowercase.test(password)) {
        errors.push(PASSWORD_MESSAGES.newPasswordLowercase);
    }

    return errors;
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
        const passwordErrors = validateNewPasswordRules(newPassword);

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
