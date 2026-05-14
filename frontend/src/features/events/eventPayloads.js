import { EVENT_MODES } from "../shared/eventModes";

/* ==================================================
   EVENT PAYLOADS
   Builds frontend event payloads before API submission

   Handles:
   - create event payloads
   - update event payloads
   - online event location normalization
   - nullable event field normalization
   - multipart form data support

   Notes:
   - aligned with backend eventDataBuilder
   - online events always use null location
   - empty optional fields are normalized to null
================================================== */

/* =============================
   VALUE NORMALIZATION
============================= */

// Converts empty values to null
const toNullableValue = (value) => {
    if (value === undefined || value === null || value === "") {
        return null;
    }

    return value;
};

// Normalizes event location based on mode
const getNormalizedLocation = ({ mode, location }) => {
    if (mode === EVENT_MODES.ONLINE) {
        return null;
    }

    return toNullableValue(location);
};

/* =============================
   EVENT DATA PAYLOADS
============================= */

// Builds a plain object payload for event create/update requests
export const buildEventPayload = (data = {}) => ({
    title: data.title,
    description: data.description,
    type: data.type,
    theme: data.theme,
    mode: data.mode,
    location: getNormalizedLocation(data),
    startDateTime: data.startDateTime,
    endDateTime: data.endDateTime,
    maxParticipants: toNullableValue(data.maxParticipants),
    registrationDeadline: toNullableValue(data.registrationDeadline),
    image: data.image ?? undefined
});

/* =============================
   FORM DATA PAYLOADS
============================= */

// Builds FormData for event create/update requests with image support
export const buildEventFormData = (data = {}) => {
    const payload = buildEventPayload(data);
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined) return;

        formData.append(key, value === null ? "" : value);
    });

    return formData;
};
