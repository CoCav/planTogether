/* ==================================================
   AUTH VALIDATION
   Frontend validation helpers aligned with backend rules
================================================== */

/* =========================
   Register validation
========================= */
export const validateRegisterForm = ({ name, email, password }) => {
    const errors = {};

    if (!name.trim()) {
        errors.name = "Name is required";
    }

    if (!email.trim()) {
        errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
        errors.email = "Invalid email";
    }

    if (!password) {
        errors.password = "Password is required";
    } else {
        const passwordErrors = [];

        if (password.length < 6) {
            passwordErrors.push("At least 6 characters");
        }

        if (!/\d/.test(password)) {
            passwordErrors.push("At least 1 number");
        }

        if (!/[A-Z]/.test(password)) {
            passwordErrors.push("At least 1 uppercase letter");
        }

        if (!/[a-z]/.test(password)) {
            passwordErrors.push("At least 1 lowercase letter");
        }

        if (passwordErrors.length > 0) {
            errors.password = passwordErrors;
        }
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
    } else if (!/\S+@\S+\.\S+/.test(email)) {
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
export const validateProfileForm = ({ name, email }) => {
    const errors = {};

    if (!name.trim()) {
        errors.name = "Name is required";
    } else if (name.trim().length < 2) {
        errors.name = "Name must be at least 2 characters long";
    }

    if (!email.trim()) {
        errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
        errors.email = "Invalid email";
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
        const passwordErrors = [];

        if (newPassword.length < 6) {
            passwordErrors.push("At least 6 characters");
        }

        if (!/\d/.test(newPassword)) {
            passwordErrors.push("At least 1 number");
        }

        if (!/[A-Z]/.test(newPassword)) {
            passwordErrors.push("At least 1 uppercase letter");
        }

        if (!/[a-z]/.test(newPassword)) {
            passwordErrors.push("At least 1 lowercase letter");
        }

        if (currentPassword && currentPassword === newPassword) {
            passwordErrors.push("New password must be different from current password");
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