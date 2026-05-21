import { useState } from "react";

import { validateLoginForm } from "../authValidation";

/* ==================================================
   USE LOGIN FORM
   Manages login form state

   Handles:
   - login form values
   - field validation errors
   - page-level errors
   - submit loading state
   - password visibility state
   - remember me state
   - shared submit validation flow

   Notes:
   - submit behavior is provided by caller
   - aligned with useRegisterForm structure
================================================== */

export default function useLoginForm({
    initialValues,
    onSubmitValid,
    submitErrorMessage = "Unable to login. Please check your credentials."
}) {

    /* =============================
       FORM STATE
    ============================= */

    const [values, setValues] = useState(initialValues);
    const [fieldErrors, setFieldErrors] = useState({});

    /* =============================
       FEEDBACK STATE
    ============================= */

    const [error, setError] = useState("");

    /* =============================
       SUBMIT STATE
    ============================= */

    const [isSubmitting, setIsSubmitting] = useState(false);

    /* =============================
       PASSWORD STATE
    ============================= */

    const [showPassword, setShowPassword] = useState(false);

    /* =============================
       REMEMBER ME STATE
    ============================= */

    // Stores session persistence choice
    const [rememberMe, setRememberMe] = useState(false);

    /* =============================
       FIELD HANDLERS
    ============================= */

    const handleFieldChange = (event) => {
        const { name, value } = event.target;

        setValues((prev) => ({
            ...prev,
            [name]: value
        }));

        // Clear field error while user edits the field
        setFieldErrors((prev) => ({
            ...prev,
            [name]: undefined
        }));
    };

    /* =============================
       REMEMBER ME
    ============================= */

    const handleRememberMeChange = (event) => {
        setRememberMe(event.target.checked);
    };

    /* =============================
       PASSWORD VISIBILITY
    ============================= */

    const handleTogglePassword = () => {
        setShowPassword((prev) => !prev);
    };

    /* =============================
       SUBMIT HANDLER
    ============================= */

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        const validationErrors = validateLoginForm(values);

        // Prevent API call when validation fails
        if (Object.keys(validationErrors).length > 0) {
            setFieldErrors(validationErrors);
            return;
        }

        setFieldErrors({});
        setIsSubmitting(true);

        try {
            // Passes remember me preference to the page-level submit handler
            await onSubmitValid(values, rememberMe);
        } catch (error) {
            console.error("Error submitting login form:", error);

            setError(submitErrorMessage);
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

        feedback: {
            error,
            setError
        },

        submitState: {
            isSubmitting
        },

        passwordState: {
            showPassword
        },

        rememberMeState: {
            rememberMe
        },

        formActions: {
            handleFieldChange,
            handleRememberMeChange,
            handleTogglePassword,
            handleSubmit
        }
    };
}
