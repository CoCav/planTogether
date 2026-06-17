import { useState } from "react";

import { validateEventReview } from "../../forms/eventReviewValidation";

/* ==================================================
   USE EVENT REVIEW FORM
   Manages event review form state

   Handles:
   - review form values
   - field validation errors
   - comment field changes
   - shared submit validation flow
   - form reset after successful submit

   Notes:
   - submit behavior is provided by caller
   - rating support will be added later
================================================== */

const initialValues = {
    comment: ""
};

export default function useEventReview({ onSubmitValid }) {

    /* =============================
       FORM STATE
    ============================= */

    const [values, setValues] = useState(initialValues);
    const [fieldErrors, setFieldErrors] = useState({});

    /* =============================
       FIELD HANDLERS
    ============================= */

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

    /* =============================
       FORM RESET
    ============================= */

    const resetForm = () => {
        setValues(initialValues);
        setFieldErrors({});
    };

    /* =============================
       SUBMIT HANDLER
    ============================= */

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationErrors = validateEventReview(values);

        if (Object.keys(validationErrors).length > 0) {
            setFieldErrors(validationErrors);
            return;
        }

        setFieldErrors({});

        await onSubmitValid({
            comment: values.comment.trim()
        });

        resetForm();
    };

    return {
        formState: {
            values,
            fieldErrors
        },

        formActions: {
            handleFieldChange,
            handleSubmit,
            resetForm
        }
    };
}
