import { validateEventImageFile } from "../shared/uploadPolicy";

import { EVENT_MODES } from "../shared/eventModes";

/* ==================================================
   EVENT VALIDATION
   Provides frontend validation for create/edit event forms

   Handles:
   - required event fields
   - event mode rules
   - start/end datetime logic
   - registration deadline logic
   - participant limit validation
   - event image validation

   Notes:
   - aligned with backend eventValidator and eventDataBuilder
   - frontend event forms should use startDateTime / endDateTime
   - online events do not require location
================================================== */

/* =============================
   SHARED HELPERS
============================= */

// Checks if a value is a positive integer
const isPositiveInteger = (value) => {
    if (value === null || value === undefined || value === "") {
        return true;
    }

    return Number.isInteger(Number(value)) && Number(value) >= 1;
};

// Checks if a value is a valid date
const isValidDate = (value) => {
    if (!value) return false;

    return !Number.isNaN(new Date(value).getTime());
};

// Checks if a mode value is valid
const isValidEventMode = (mode) => {
    return [EVENT_MODES.ONLINE, EVENT_MODES.IN_PERSON].includes(mode);
};

/* =============================
   EVENT FORM VALIDATION
============================= */

// Validates create/edit event form data
export const validateEventForm = (
    {
        title,
        description,
        type,
        theme,
        mode,
        location,
        startDateTime,
        endDateTime,
        maxParticipants,
        registrationDeadline,
        image
    },
    options = {}
) => {

    const { allowPartial = false } = options;

    const errors = {};

    /* =============================
       REQUIRED TEXT FIELDS
    ============================= */

    if (!allowPartial || title !== undefined) {
        if (!title?.trim()) {
            errors.title = allowPartial
                ? "Title cannot be empty"
                : "Title is required";
        }
    }

    if (!allowPartial || description !== undefined) {
        if (!description?.trim()) {
            errors.description = allowPartial
                ? "Description cannot be empty"
                : "Description is required";
        }
    }

    if (!allowPartial || type !== undefined) {
        if (!type?.trim()) {
            errors.type = "Type is required";
        }
    }

    if (!allowPartial || theme !== undefined) {
        if (!theme?.trim()) {
            errors.theme = "Theme is required";
        }
    }

    /* =============================
       MODE / LOCATION
    ============================= */

    if (!allowPartial || mode !== undefined) {
        if (!mode) {
            errors.mode = "Mode is required";
        } else if (!isValidEventMode(mode)) {
            errors.mode = "Mode must be online or in_person";
        }
    }

    if (mode === EVENT_MODES.IN_PERSON && !location?.trim()) {
        errors.location = "Location is required for in-person events";
    }

    /* =============================
       DATE / TIME
    ============================= */

    if (!allowPartial || startDateTime !== undefined) {
        if (!startDateTime) {
            errors.startDateTime = "Start date and time is required";
        } else if (!isValidDate(startDateTime)) {
            errors.startDateTime = "Start date and time must be a valid date";
        }
    }

    if (!allowPartial || endDateTime !== undefined) {
        if (!endDateTime) {
            errors.endDateTime = "End date and time is required";
        } else if (!isValidDate(endDateTime)) {
            errors.endDateTime = "End date and time must be a valid date";
        }
    }

    const start = isValidDate(startDateTime) ? new Date(startDateTime) : null;

    const end = isValidDate(endDateTime) ? new Date(endDateTime) : null;

    if (start && end && end <= start) {
        errors.endDateTime =
            "End date and time must be after start date and time";
    }

    /* =============================
       PARTICIPANTS / REGISTRATION
    ============================= */

    if (!isPositiveInteger(maxParticipants)) {
        errors.maxParticipants = "Max participants must be a positive integer";
    }

    if (registrationDeadline) {
        if (!isValidDate(registrationDeadline)) {
            errors.registrationDeadline =
                "Registration deadline must be a valid date";
        } else if (start && new Date(registrationDeadline) >= start) {
            errors.registrationDeadline =
                "Registration deadline must be before event start date";
        }
    }

    /* =============================
       EVENT IMAGE
    ============================= */

    const imageError = validateEventImageFile(image);

    if (imageError) {
        errors.image = imageError;
    }

    return errors;
};
