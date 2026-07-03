import { useState } from "react";

import { getApiErrorMessage } from "../../../../api/apiError";

import { EVENT_MODES } from "../../../shared/constants/eventModes";
import { EVENT_REGISTRATION_DEADLINES } from "../../../shared/constants/eventRegistrationDeadlines";

import { isOnlineEventForm, shouldShowCustomDeadline } from "../../form/eventFormConfig";

import { formatLocationSelectionLabel } from "../../../../utils/formatters";

import { validateEventForm } from "../../form/eventValidation";

/* ==================================================
   USE EVENT FORM
   Manages shared create/edit event form state

   Handles:
   - event form values
   - structured location state
   - structured location reset
   - field validation errors
   - page-level errors
   - submit loading state
   - field changes
   - dependent field resets
   - image changes
   - shared submit validation flow
   - configurable validation options

   Notes:
   - submit behavior is provided by caller
   - reusable by CreateEventPage and EditEventPage
   - validation options support create/edit differences
   - selectedLocation is used for map preview only
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
            // Clear location data when switching to online mode
            if (name === "mode" && value === EVENT_MODES.ONLINE) {
                return {
                    ...prev,
                    mode: value,
                    location: "",
                    locationLabel: "",
                    streetAddress: "",
                    city: "",
                    region: "",
                    postalCode: "",
                    country: "",
                    latitude: null,
                    longitude: null,
                    selectedLocation: null
                };
            }

            // Clear structured location data when user manually edits the location text
            if (name === "location") {
                return {
                    ...prev,
                    location: value,
                    locationLabel: "",
                    streetAddress: "",
                    city: "",
                    region: "",
                    postalCode: "",
                    country: "",
                    latitude: null,
                    longitude: null,
                    selectedLocation: null
                };
            }

            // Clear custom deadline value when switching away from custom deadline
            if (name === "registrationDeadlineOption" && value !== EVENT_REGISTRATION_DEADLINES.CUSTOM) {
                return {
                    ...prev,
                    registrationDeadlineOption: value,
                    registrationDeadlineCustom: ""
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
       LOCATION HANDLER
    ============================= */

    // Stores selected autocomplete suggestion and uses its label as form location
    const handleLocationSelect = (location) => {
        setValues((prev) => ({
            ...prev,

            // Store readable location text and structured address fields
            location: formatLocationSelectionLabel(location),
            locationLabel: location.label ?? "",
            streetAddress: location.streetAddress ?? "",
            city: location.city ?? "",
            region: location.region ?? "",
            postalCode: location.postalCode ?? "",
            country: location.country ?? "",
            latitude: location.latitude ?? null,
            longitude: location.longitude ?? null,
            selectedLocation: location
        }));

        setFieldErrors((prev) => ({
            ...prev,
            location: undefined
        }));
    };

    /* =============================
       SUBMIT HANDLER
    ============================= */

    // Validate form values before submission
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

            setError(getApiErrorMessage(error, submitErrorMessage));
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
            handleLocationSelect,
            handleSubmit
        }
    };
}
