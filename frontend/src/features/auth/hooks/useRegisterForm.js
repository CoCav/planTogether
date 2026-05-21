import { useState } from "react";

import { validateRegisterForm } from "../authValidation";

/* ==================================================
   USE REGISTER FORM
   Manages register form state

   Handles:
   - register form values
   - field validation errors
   - page-level errors
   - submit loading state
   - field changes
   - avatar changes
   - password visibility state
   - shared submit validation flow

   Notes:
   - submit behavior is provided by caller
   - aligned with useEventForm structure
================================================== */

export default function useRegisterForm({
    initialValues,
    onSubmitValid,
    submitErrorMessage = "Unable to register. Please check your information."
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
       AVATAR HANDLERS
    ============================= */

    const handleAvatarChange = (event) => {
        const file = event.target.files?.[0] || null;

        setValues((prev) => ({
            ...prev,
            avatar: file
        }));

        // Clear avatar error after selecting a file
        setFieldErrors((prev) => ({
            ...prev,
            avatar: undefined
        }));
    };

    const handleRemoveAvatar = () => {
        setValues((prev) => ({
            ...prev,
            avatar: null
        }));

        // Clear avatar error after removing the file
        setFieldErrors((prev) => ({
            ...prev,
            avatar: undefined
        }));
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

        const validationErrors = validateRegisterForm(values);

        if (Object.keys(validationErrors).length > 0) {
            setFieldErrors(validationErrors);
            return;
        }

        setFieldErrors({});
        setIsSubmitting(true);

        try {
            await onSubmitValid(values);
        } catch (error) {
            console.error("Error submitting register form:", error);

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

        formActions: {
            handleFieldChange,
            handleAvatarChange,
            handleRemoveAvatar,
            handleTogglePassword,
            handleSubmit
        }
    };
}
