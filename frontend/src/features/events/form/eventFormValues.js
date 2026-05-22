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
   - registration deadline mapping

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

    return date.toISOString().slice(0, 16);
};

/* =============================
   EVENT FORM VALUES
============================= */

// Builds EventForm values from API event data
export const createEventFormValuesFromEvent = (event = {}) => ({
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

    registrationDeadlineOption: event.registrationDeadline
        ? EVENT_REGISTRATION_DEADLINES.CUSTOM
        : EVENT_REGISTRATION_DEADLINES.NONE,

    registrationDeadlineCustom: toDateTimeLocalValue(event.registrationDeadline),

    image: null,
    currentImage: event.image || null
});
