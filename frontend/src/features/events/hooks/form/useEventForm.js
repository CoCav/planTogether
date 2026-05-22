import { useState } from "react";

import { EVENT_MODES } from "../../../shared/constants/eventModes";

import { isOnlineEventForm, shouldShowCustomDeadline } from "../../form/eventFormConfig";

import { validateEventForm } from "../../form/eventValidation";

/* ==================================================
   USE EVENT FORM
   Manages shared create/edit event form state

   Handles:
   - event form values
   - field validation errors
   - page-level errors
   - submit loading state
   - field changes
   - image changes
   - shared submit validation flow
   - configurable validation options

   Notes:
   - submit behavior is provided by caller
   - reusable by CreateEventPage and EditEventPage
   - validation options support create/edit differences
================================================== */

export default function useEventForm({
    initialValues,
    onSubmitValid,
    submitErrorMessage = "Failed to save event",
    validationOptions = {}
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
       FORM HELPERS
    ============================= */

    const isOnlineEvent = isOnlineEventForm(values);

    const showCustomDeadline = shouldShowCustomDeadline(values);

    /* =============================
       FIELD HANDLERS
    ============================= */

    const handleFieldChange = (event) => {
        const { name, value } = event.target;

        setValues((prev) => {
            // Clear location when switching to online mode
            if (name === "mode" && value === EVENT_MODES.ONLINE) {
                return {
                    ...prev,
                    mode: value,
                    location: ""
                };
            }

            return {
                ...prev,
                [name]: value
            };
        });

        // Clear field error while user edits the field
        setFieldErrors((prev) => ({
            ...prev,
            [name]: undefined
        }));
    };

    /* =============================
       IMAGE HANDLERS
    ============================= */

    const handleImageChange = (event) => {
        const file = event.target.files?.[0] || null;

        setValues((prev) => ({
            ...prev,
            image: file
        }));

        setFieldErrors((prev) => ({
            ...prev,
            image: undefined
        }));
    };

    const handleRemoveImage = () => {
        setValues((prev) => ({
            ...prev,
            image: null,
            currentImage: null
        }));

        setFieldErrors((prev) => ({
            ...prev,
            image: undefined
        }));
    };

    /* =============================
       SUBMIT HANDLER
    ============================= */

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        const validationErrors = validateEventForm(
            values,
            validationOptions
        );

        if (Object.keys(validationErrors).length > 0) {
            setFieldErrors(validationErrors);
            return;
        }

        setFieldErrors({});
        setIsSubmitting(true);

        try {
            await onSubmitValid(values);
        } catch (error) {
            console.error("Error submitting event form:", error);

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

        formHelpers: {
            isOnlineEvent,
            showCustomDeadline
        },

        formActions: {
            handleFieldChange,
            handleImageChange,
            handleRemoveImage,
            handleSubmit
        }
    };
}
