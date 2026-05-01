/* ==================================================
   AUTH VALIDATION
   Provides frontend validation helpers for auth forms

   Covers:
   - register form
   - login form
   - profile update
   - password change
================================================== */

/* =========================
   Shared helpers
========================= */

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

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

/* =========================
   Register validation
========================= */

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

/* =========================
   Login validation
========================= */

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

/* =========================
   Profile validation
========================= */

export const validateProfileForm = ({ name, email, avatar }) => {
    const errors = {};

    if (!name.trim()) {
        errors.name = "Name is required";
    } else if (name.trim().length < 2) {
        errors.name = "Name must be at least 2 characters long";
    }

    if (!email.trim()) {
        errors.email = "Email is required";
    } else if (!isValidEmail(email)) {
        errors.email = "Invalid email";
    }

    const avatarError = validateAvatarFile(avatar);

    if (avatarError) {
        errors.avatar = avatarError;
    }

    return errors;
};

/* =========================
   Change password validation
========================= */

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
        errors.confirmPassword =
            "Passwords do not match. Please check again.";
    }

    return errors;
};
