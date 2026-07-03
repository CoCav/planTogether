import { EVENT_MODES, getEventModeLabel } from "../../shared/constants/eventModes";
import {
    EVENT_REGISTRATION_DEADLINES,
    getEventRegistrationDeadlineLabel
} from "../../shared/constants/eventRegistrationDeadlines";

/* ==================================================
   EVENT FORM CONFIG
   Provides shared event form configuration

   Handles:
   - default event form values
   - selected location state for autocomplete/map preview
   - event mode select options
   - registration deadline select options
   - event form display helpers

   Notes:
   - shared by create and edit event forms
   - event mode and registration deadline values come from shared constants
   - selectedLocation stores the chosen geocoded location suggestion
================================================== */

/* =============================
   DEFAULT VALUES
============================= */

export const createDefaultEventFormValues = () => ({
    title: "",
    description: "",
    type: "",
    theme: "",

    mode: EVENT_MODES.IN_PERSON,

    location: "",
    selectedLocation: null,
    locationLabel: "",
    streetAddress: "",
    city: "",
    region: "",
    postalCode: "",
    country: "",
    latitude: null,
    longitude: null,

    startDateTime: "",
    endDateTime: "",

    maxParticipants: "",

    registrationDeadlineOption: EVENT_REGISTRATION_DEADLINES.NONE,
    registrationDeadlineCustom: "",

    image: null,
    currentImage: null
});

/* =============================
   SELECT OPTIONS
============================= */

export const EVENT_MODE_OPTIONS = Object.values(EVENT_MODES).map((mode) => ({
    value: mode,
    label: getEventModeLabel(mode)
}));

export const EVENT_REGISTRATION_DEADLINE_OPTIONS = Object.values(
    EVENT_REGISTRATION_DEADLINES
).map((deadline) => ({
    value: deadline,
    label: getEventRegistrationDeadlineLabel(deadline)
}));

/* =============================
   DISPLAY HELPERS
============================= */

// Checks if event form values represent an online event
export const isOnlineEventForm = (values = {}) => {
    return values.mode === EVENT_MODES.ONLINE;
};

// Checks if custom registration deadline input should be displayed
export const shouldShowCustomDeadline = (values = {}) => {
    return values.registrationDeadlineOption === EVENT_REGISTRATION_DEADLINES.CUSTOM;
};
