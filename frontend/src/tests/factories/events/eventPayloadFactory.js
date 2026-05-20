import { EVENT_MODES } from "../../../features/shared/eventModes";

import { createEventImageFile } from "../shared/fileFactory";

/* ==================================================
   EVENT PAYLOAD TEST FACTORY

   Handles:
   - event payload generation
   - online event payload generation
   - event form payload generation

   Notes:
   - aligned with eventPayload builders
   - uses datetime-local compatible values
   - accepts overrides for flexible scenarios
================================================== */

/* =============================
   EVENT PAYLOADS
============================= */

// Generate an event payload
export const createEventPayload = (overrides = {}) => ({
    title: "Test Event",
    description: "A test event",

    type: "Meetup",
    theme: "Tech",

    mode: EVENT_MODES.IN_PERSON,
    location: "Montreal",

    startDateTime: "2026-12-20T10:00",
    endDateTime: "2026-12-20T12:00",

    maxParticipants: "10",
    registrationDeadline: "2026-12-19T12:00",

    image: undefined,

    ...overrides
});

// Generate an online event payload
export const createOnlineEventPayload = (overrides = {}) => (
    createEventPayload({
        mode: EVENT_MODES.ONLINE,
        location: "Online",

        ...overrides
    })
);

// Generate an event payload with image
export const createEventPayloadWithImage = (overrides = {}) => (
    createEventPayload({
        image: createEventImageFile(),

        ...overrides
    })
);

/* =============================
   NULLABLE PAYLOADS
============================= */

// Generate an event payload with empty nullable fields
export const createEventPayloadWithEmptyOptionals = (overrides = {}) => (
    createEventPayload({
        maxParticipants: "",
        registrationDeadline: "",
        image: undefined,

        ...overrides
    })
);
