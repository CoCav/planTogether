import { useState } from "react";

import { validateEventReview } from "../../forms/eventReviewValidation";

/* ==================================================
   USE EVENT REVIEW FORM
   Manages event review form state

   Handles:
   - rating and comment values
   - field validation errors
   - rating selection changes
   - comment field changes
   - shared submit validation flow
   - form reset after successful submit

   Notes:
   - submit behavior is provided by caller
   - submitted review data includes rating and trimmed comment
================================================== */


export default function useEventReviewForm({
    initialValues = {
        rating: "",
        comment: ""
    },
    onSubmitValid
}) {

    /* =============================
       FORM STATE
    ============================= */

    const [values, setValues] = useState(initialValues);
    const [fieldErrors, setFieldErrors] = useState({});

    /* =============================
       FIELD HANDLERS
    ============================= */

    // Updates text fields and clears their validation error
    const handleFieldChange = (event) => {
        const { name, value } = event.target;

        setValues((prev) => ({
            ...prev,
            [name]: value
        }));

        setFieldErrors((prev) => ({
            ...prev,
            [name]: undefined
        }));
    };

    // Updates rating value and clears rating validation error
    const handleRatingChange = (rating) => {
        setValues((prev) => ({
            ...prev,
            rating
        }));

        setFieldErrors((prev) => ({
            ...prev,
            rating: undefined
        }));
    };

    /* =============================
       FORM RESET
    ============================= */

    // Restores initial review form values
    const resetForm = () => {
        setValues(initialValues);
        setFieldErrors({});
    };

    /* =============================
       SUBMIT HANDLER
    ============================= */

    // Validates and submits rating with a trimmed comment
    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationErrors = validateEventReview(values);

        if (Object.keys(validationErrors).length > 0) {
            setFieldErrors(validationErrors);
            return;
        }

        setFieldErrors({});

        const success = await onSubmitValid?.({
            rating: Number(values.rating),
            comment: values.comment.trim()
        });

        if (success !== false) {
            resetForm();
        }
    };

    return {
        formState: {
            values,
            fieldErrors
        },

        formActions: {
            handleFieldChange,
            handleRatingChange,
            handleSubmit,
            resetForm
        }
    };
}
