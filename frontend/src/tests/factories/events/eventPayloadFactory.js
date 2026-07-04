import { EVENT_MODES } from "../../../features/shared/constants/eventModes";

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
    locationLabel: "Agora du Vieux-Port, Rue de Quercy, Québec, Canada",
    streetAddress: "Rue de Quercy",
    city: "Québec",
    region: "Québec",
    postalCode: "G1K 4B9",
    country: "Canada",
    latitude: 46.8176197,
    longitude: -71.2004237,

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
        locationLabel: null,
        streetAddress: null,
        city: null,
        region: null,
        postalCode: null,
        country: null,
        latitude: null,
        longitude: null,

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
