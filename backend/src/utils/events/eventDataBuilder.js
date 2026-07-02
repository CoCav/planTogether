const { EVENT_MODES } = require("../../constants/eventModes");

/* ==================================================
   EVENT DATA BUILDER

   Handles:
   - event creation payload normalization
   - partial event update payload normalization
   - online event location normalization
   - event geolocation data persistence
   - nullable event field normalization
   - event image preservation, replacement and clearing

   Notes:
   - create payloads always contain full event data
   - update payloads preserve existing fields when omitted
   - update payloads can explicitly clear nullable fields
   - online events always use null location and geolocation data
================================================== */

/* =============================
   LOCATION DATA
============================= */

// Builds empty structured location data
const buildEmptyLocationData = () => ({
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

// Builds persisted structured location data from a resolved location
const buildLocationData = (locationData) => {
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
   CREATE EVENT DATA
============================= */

// Build normalized event creation payload
const buildEventCreateData = (data, creatorId, locationData = {}) => {
    const isOnlineEvent = data.mode === EVENT_MODES.ONLINE;

    return {
        creatorId,
        title: data.title,
        description: data.description,
        type: data.type,
        theme: data.theme,
        mode: data.mode,

        ...(isOnlineEvent
            ? buildEmptyLocationData()
            : {
                location: data.location,
                ...buildLocationData(locationData)
            }),

        startDateTime: data.startDateTime,
        endDateTime: data.endDateTime,
        maxParticipants: data.maxParticipants ?? null,
        registrationDeadline: data.registrationDeadline ?? null,
        image: data.image ?? null
    };
};

/* =============================
   UPDATE EVENT DATA
============================= */

// Build normalized partial event update payload
const buildEventUpdateData = (event, data, locationData = null) => {
    const updatedData = {};

    const updatableFields = [
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

    // Preserve existing values when fields are omitted
    for (const field of updatableFields) {
        if (data[field] !== undefined) {
            updatedData[field] = data[field];
        }
    }

    const nextMode = data.mode ?? event.mode;

    // Online events never keep physical location or geolocation data
    if (nextMode === EVENT_MODES.ONLINE) {
        Object.assign(updatedData, buildEmptyLocationData());

    } else if (data.location !== undefined) {
        updatedData.location = data.location;
        Object.assign(updatedData, buildLocationData(locationData));
    }

    // Keep existing image unless explicitly updated or cleared
    if (data.image !== undefined) {
        updatedData.image = data.image || null;

    } else {
        updatedData.image = event.image;
    }

    return updatedData;
};

module.exports = {
    buildEventCreateData,
    buildEventUpdateData,
    buildEmptyLocationData,
    buildLocationData
};
