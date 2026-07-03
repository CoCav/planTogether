import { EVENT_MODES } from "../../shared/constants/eventModes";
import { EVENT_REGISTRATION_DEADLINES } from "../../shared/constants/eventRegistrationDeadlines";

/* ==================================================
   EVENT PAYLOAD BUILDER
   Builds frontend event payloads before API submission

   Handles:
   - registration deadline resolution
   - create/update event payloads
   - online event location normalization
   - nullable event field normalization
   - autocomplete UI state exclusion
   - structured location payload building
   - online structured location clearing
   - unchanged image omission
   - explicit image clearing for updates
   - multipart form data support

   Notes:
   - aligned with backend eventDataBuilder
   - event forms use datetime-local values
   - selectedLocation is UI-only and is not submitted
   - structured location fields are submitted separately
   - online events always use null location
   - create payloads omit null optional fields
   - update payloads preserve explicit null field clearing
   - undefined image values are omitted to keep existing images unchanged
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

// Normalizes event location text based on mode
const getNormalizedLocation = ({ mode, location } = {}) => {
    if (mode === EVENT_MODES.ONLINE) {
        return null;
    }

    return toNullableValue(location);
};

// Normalizes structured location fields based on mode
const getNormalizedStructuredLocation = (data = {}) => {
    if (data.mode === EVENT_MODES.ONLINE) {
        return {
            locationLabel: null,
            streetAddress: null,
            city: null,
            region: null,
            postalCode: null,
            country: null,
            latitude: null,
            longitude: null
        };
    }

    return {
        locationLabel: toNullableValue(data.locationLabel),
        streetAddress: toNullableValue(data.streetAddress),
        city: toNullableValue(data.city),
        region: toNullableValue(data.region),
        postalCode: toNullableValue(data.postalCode),
        country: toNullableValue(data.country),
        latitude: toNullableValue(data.latitude),
        longitude: toNullableValue(data.longitude)
    };
};

/* =============================
   REGISTRATION DEADLINE
============================= */

// Resolves registration deadline from event form values
export const buildRegistrationDeadline = (values = {}) => {
    if (!values.startDateTime) {
        return null;
    }

    const eventStart = new Date(values.startDateTime);

    if (Number.isNaN(eventStart.getTime())) {
        return null;
    }

    switch (values.registrationDeadlineOption) {
        case EVENT_REGISTRATION_DEADLINES.DAY_BEFORE:
            return new Date(
                eventStart.getTime() - 24 * 60 * 60 * 1000
            ).toISOString();

        case EVENT_REGISTRATION_DEADLINES.TWO_DAYS_BEFORE:
            return new Date(
                eventStart.getTime() - 2 * 24 * 60 * 60 * 1000
            ).toISOString();

        case EVENT_REGISTRATION_DEADLINES.CUSTOM:
            return values.registrationDeadlineCustom
                ? new Date(values.registrationDeadlineCustom).toISOString()
                : null;

        default:
            return null;
    }
};

/* =============================
   FORM PAYLOAD
============================= */

// Builds an API-ready payload from event form values
export const buildEventFormPayload = (values = {}) => ({
    title: values.title,
    description: values.description,

    type: values.type,
    theme: values.theme,

    mode: values.mode,

    location: values.location,
    locationLabel: values.locationLabel,
    streetAddress: values.streetAddress,
    city: values.city,
    region: values.region,
    postalCode: values.postalCode,
    country: values.country,
    latitude: values.latitude,
    longitude: values.longitude,

    startDateTime: values.startDateTime,
    endDateTime: values.endDateTime,

    maxParticipants: values.maxParticipants,

    registrationDeadline: buildRegistrationDeadline(values),

    image: values.image
});

/* =============================
   EVENT DATA PAYLOADS
============================= */

// Builds a normalized plain object payload for event create/update requests
export const buildEventPayload = (data = {}) => ({
    title: data.title,
    description: data.description,

    type: data.type,
    theme: data.theme,

    mode: data.mode,

    location: getNormalizedLocation(data),
    ...getNormalizedStructuredLocation(data),

    startDateTime: data.startDateTime,
    endDateTime: data.endDateTime,

    maxParticipants: toNullableValue(data.maxParticipants),

    registrationDeadline: toNullableValue(data.registrationDeadline),

    image: data.image === undefined ? undefined : data.image
});

/* =============================
   FORM DATA PAYLOADS
============================= */

// Builds FormData for event creation requests
// Null optional fields are omitted
export const buildEventFormData = (data = {}) => {
    const payload = buildEventPayload(data);
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        formData.append(key, value);
    });

    return formData;
};

// Builds FormData for event update requests
// Null values are sent as empty strings to clear existing data
export const buildEventUpdateFormData = (data = {}) => {
    const payload = buildEventPayload(data);
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined) return;

        formData.append(key, value === null ? "" : value);
    });

    return formData;
};

// Builds FormData directly from event form values
export const buildEventFormPayloadData = (values = {}) => {
    return buildEventFormData(
        buildEventFormPayload(values)
    );
};

// Builds update FormData directly from event form values
export const buildEventUpdateFormPayloadData = (values = {}) => {
    return buildEventUpdateFormData(
        buildEventFormPayload(values)
    );
};
