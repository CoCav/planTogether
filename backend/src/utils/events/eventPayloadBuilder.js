const { EVENT_MODES } = require("../../constants/eventModes");

/* ==========================================================================
   Event Payload Builder

   Builds normalized payloads used to create and update events.

   Responsibilities
   - Build event creation payloads
   - Build event update payloads
   - Normalize structured location data
   - Normalize nullable fields
   - Preserve existing event data when appropriate

   Notes
   - Online events never persist physical location data.
   - Create payloads always contain full event data.
   - Update payloads preserve omitted fields.
=========================================================================== */

/* =============================
   UPDATABLE EVENT FIELDS
============================= */

const UPDATABLE_EVENT_FIELDS = [
    "title",
    "description",
    "type",
    "theme",
    "mode",
    "startDateTime",
    "endDateTime",
    "maxParticipants",
    "registrationDeadline"
];

/* =============================
   LOCATION PAYLOAD BUILDERS
============================= */

// Build empty structured location data for online events
const buildEmptyStructuredLocationData = () => ({
    location: null,
    locationLabel: null,
    streetAddress: null,
    city: null,
    region: null,
    postalCode: null,
    country: null,
    latitude: null,
    longitude: null
});

// Normalize resolved geocoding data before persistence
const buildStructuredLocationData = (locationData) => {
    const location = locationData ?? {};

    return {
        locationLabel: location.label ?? location.locationLabel ?? null,
        streetAddress: location.streetAddress ?? null,
        city: location.city ?? null,
        region: location.region ?? null,
        postalCode: location.postalCode ?? null,
        country: location.country ?? null,
        latitude: location.latitude ?? null,
        longitude: location.longitude ?? null
    };
};

/* =============================
   EVENT PAYLOAD BUILDERS
============================= */

// Build a complete event creation payload
const buildCreateEventPayload = (payload, creatorId, locationData = {}) => {
    const isOnlineEvent = payload.mode === EVENT_MODES.ONLINE;

    return {
        creatorId,
        title: payload.title,
        description: payload.description,
        type: payload.type,
        theme: payload.theme,
        mode: payload.mode,

        ...(isOnlineEvent
            ? buildEmptyStructuredLocationData()
            : {
                location: payload.location,
                ...buildStructuredLocationData(locationData)
            }),

        startDateTime: payload.startDateTime,
        endDateTime: payload.endDateTime,
        maxParticipants: payload.maxParticipants ?? null,
        registrationDeadline: payload.registrationDeadline ?? null,
        image: payload.image ?? null
    };
};

// Build an event update payload while preserving omitted fields
const buildUpdateEventPayload = (event, payload, locationData = null) => {
    const updatedPayload = {};

    // Copy only fields that are present in the update payload
    for (const field of UPDATABLE_EVENT_FIELDS) {
        if (payload[field] !== undefined) {
            updatedPayload[field] = payload[field];
        }
    }

    const nextMode = payload.mode ?? event.mode;

    if (nextMode === EVENT_MODES.ONLINE) {
        updatedPayload.location = null;

        Object.assign(updatedPayload, buildEmptyStructuredLocationData());
    } else if (payload.location !== undefined) {
        updatedPayload.location = payload.location;

        Object.assign(
            updatedPayload,
            buildStructuredLocationData(locationData)
        );
    }

    // Preserve the current image unless it is explicitly replaced or removed
    if (payload.image !== undefined) {
        updatedPayload.image = payload.image || null;
    } else {
        updatedPayload.image = event.image;
    }

    return updatedPayload;
};

module.exports = {
    buildCreateEventPayload,
    buildUpdateEventPayload,
    buildEmptyStructuredLocationData,
    buildStructuredLocationData
};
