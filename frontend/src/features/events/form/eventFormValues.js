import { EVENT_MODES } from "../../shared/constants/eventModes";
import { EVENT_REGISTRATION_DEADLINES } from "../../shared/constants/eventRegistrationDeadlines";

import { createDefaultEventFormValues } from "./eventFormConfig";

/* ==================================================
   EVENT FORM VALUES
   Builds event form values from API event data

   Handles:
   - edit event form prefill values
   - datetime-local value formatting
   - existing image mapping
   - registration deadline option resolution

   Notes:
   - used by EditEventPage
   - keeps API event -> EventForm conversion centralized
================================================== */

/* =============================
   DATE HELPERS
============================= */

// Converts an API datetime value into datetime-local input value
export const toDateTimeLocalValue = (value) => {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/* =============================
   REGISTRATION DEADLINE HELPERS
============================= */

// Resolves how many full days exist between event start and registration deadline
const getRegistrationDeadlineOffsetInDays = ({ startDateTime, registrationDeadline }) => {
    const start = new Date(startDateTime);
    const deadline = new Date(registrationDeadline);

    if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(deadline.getTime())
    ) {
        return null;
    }

    const diffInMs = start.getTime() - deadline.getTime();
    const dayInMs = 24 * 60 * 60 * 1000;

    if (diffInMs % dayInMs !== 0) {
        return null;
    }

    return diffInMs / dayInMs;
};

// Resolves registration deadline select option from API event data
export const resolveRegistrationDeadlineOption = (event = {}) => {
    if (!event.registrationDeadline) {
        return EVENT_REGISTRATION_DEADLINES.NONE;
    }

    const offsetInDays = getRegistrationDeadlineOffsetInDays({
        startDateTime: event.startDateTime,
        registrationDeadline: event.registrationDeadline
    });

    if (offsetInDays === 1) {
        return EVENT_REGISTRATION_DEADLINES.DAY_BEFORE;
    }

    if (offsetInDays === 2) {
        return EVENT_REGISTRATION_DEADLINES.TWO_DAYS_BEFORE;
    }

    return EVENT_REGISTRATION_DEADLINES.CUSTOM;
};

/* =============================
   EVENT FORM VALUES
============================= */

// Builds EventForm values from API event data
export const createEventFormValuesFromEvent = (event = {}) => {
    const registrationDeadlineOption =
        resolveRegistrationDeadlineOption(event);

    return {
        ...createDefaultEventFormValues(),

        title: event.title || "",
        description: event.description || "",

        type: event.type || "",
        theme: event.theme || "",

        mode: event.mode || EVENT_MODES.IN_PERSON,
        location: event.location || "",

        startDateTime: toDateTimeLocalValue(event.startDateTime),
        endDateTime: toDateTimeLocalValue(event.endDateTime),

        maxParticipants: event.maxParticipants || "",

        registrationDeadlineOption,

        registrationDeadlineCustom:
            registrationDeadlineOption === EVENT_REGISTRATION_DEADLINES.CUSTOM
                ? toDateTimeLocalValue(event.registrationDeadline)
                : "",

        image: null,
        currentImage: event.image || null
    };
};
