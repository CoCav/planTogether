/* ==================================================
   EVENT DATA BUILDER UTILS

   Handles:
   - event creation payload normalization
   - partial event update payload normalization
   - online event location normalization
   - nullable event field normalization

   Notes:
   - create payloads always contain full event data
   - update payloads preserve existing fields when omitted
   - online events always use a null location
================================================== */

/* =============================
   CREATE EVENT DATA
============================= */

// Build normalized event creation payload
const buildEventCreateData = (data, creatorId) => {
    return {
        creatorId,
        title: data.title,
        description: data.description,
        type: data.type,
        theme: data.theme,
        mode: data.mode,
        location: data.mode === "online" ? null : data.location,
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
const buildEventUpdateData = (event, data) => {
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

    // Online events never keep a physical location
    if (data.mode === "online") {
        updatedData.location = null;

    } else if (data.location !== undefined) {
        updatedData.location = data.location;
    }

    // Keep existing image unless explicitly updated
    if (data.image !== undefined) {
        updatedData.image = data.image;

    } else {
        updatedData.image = event.image;
    }

    return updatedData;
};

module.exports = { buildEventCreateData, buildEventUpdateData };
