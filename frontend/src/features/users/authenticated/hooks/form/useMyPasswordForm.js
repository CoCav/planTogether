import { useState } from "react";

import { getApiErrorMessage } from "../../../../../api/apiError";
import { changeCurrentUserPassword } from "../../../../../api/users/userApi";

import { validateChangePasswordForm } from "../../../userValidation";

/* ==================================================
   USE MY PASSWORD FORM
   Manages authenticated user password update form state

   Handles:
   - password form values
   - field validation errors
   - submit loading state
   - password visibility toggles
   - password update submission
   - password form reset after success
================================================== */

const createDefaultPasswordValues = () => ({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
});

const createDefaultPasswordVisibility = () => ({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
});

export default function useMyPasswordForm({ setMessage, setError }) {

    /* =============================
       FORM STATE
    ============================= */

    const [values, setValues] = useState(createDefaultPasswordValues);
    const [fieldErrors, setFieldErrors] = useState({});

    /* =============================
       PASSWORD VISIBILITY
    ============================= */

    const [showPasswords, setShowPasswords] = useState(createDefaultPasswordVisibility);

    /* =============================
       SUBMIT STATE
    ============================= */

    const [isSubmitting, setIsSubmitting] = useState(false);

    /* =============================
       FIELD HANDLERS
    ============================= */

    // Updates password form values
    const handleFieldChange = (event) => {
        const { name, value } = event.target;

        setValues((prev) => ({
            ...prev,
            [name]: value
        }));

        // Clears field error while user edits the field
        setFieldErrors((prev) => ({
            ...prev,
            [name]: undefined
        }));
    };

    /* =============================
       PASSWORD VISIBILITY HANDLERS
    ============================= */

    // Toggles password visibility by field name
    const handleTogglePassword = (field) => {
        setShowPasswords((prev) => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    /* =============================
       SUBMIT HANDLER
    ============================= */

    // Validates and updates authenticated user password
    const handleSubmit = async (event) => {
        event.preventDefault();

        setMessage("");
        setError("");

        const validationErrors = validateChangePasswordForm(values);

        if (Object.keys(validationErrors).length > 0) {
            setFieldErrors(validationErrors);
            return;
        }

        setFieldErrors({});
        setIsSubmitting(true);

        try {
            await changeCurrentUserPassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword
            });

            setMessage("Password updated successfully");

            // Reset password form after successful update
            setValues(createDefaultPasswordValues());
            setShowPasswords(createDefaultPasswordVisibility());

        } catch (error) {
            console.error("Error updating password:", error);

            const status = error.response?.status;

            const errorMessage = getApiErrorMessage(
                error,
                "Unable to update password"
            );

            // Maps invalid current password error to current password field
            if (status === 401) {
                setFieldErrors((prev) => ({
                    ...prev,
                    currentPassword: errorMessage
                }));

                return;
            }

            // Maps backend new password validation error to new password field
            if (status === 400 && errorMessage.toLowerCase().includes("new password")) {
                setFieldErrors((prev) => ({
                    ...prev,
                    newPassword: errorMessage
                }));

                return;
            }

            setError(errorMessage);

        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        formState: {
            values,
            setValues,
            fieldErrors,
            setFieldErrors
        },

        submitState: {
            isSubmitting
        },

        passwordState: {
            showPasswords,
            setShowPasswords
        },

        formActions: {
            handleFieldChange,
            handleTogglePassword,
            handleSubmit
        }
    };
}
