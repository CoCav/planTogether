import { EVENT_MODES } from "../../../features/shared/constants/eventModes";
import { EVENT_STATUS } from "../../../features/shared/constants/eventStatus";

/* ==================================================
   EVENT TEST FACTORY

   Handles:
   - event object generation
   - event geolocation test data
   - paginated event payload generation
   - event form data generation

   Notes:
   - shared across frontend unit and component tests
   - accepts overrides for flexible scenarios
   - default in-person events include persisted location metadata
================================================== */

/* =============================
   EVENTS
============================= */

// Generate a normalized event object
export const createEvent = (overrides = {}) => ({
    id: 1,
    title: "Test Event",
    description: "A test event",

    theme: "Tech",
    type: "Meetup",

    mode: EVENT_MODES.IN_PERSON,

    location: "Montreal",
    locationLabel: "Agora du Vieux-Port, Rue de Quercy, Québec, G1K 4B9, Canada",
    latitude: 46.8176,
    longitude: -71.2004,

    startDateTime: "2026-12-20T10:00:00.000Z",
    endDateTime: "2026-12-20T12:00:00.000Z",

    creatorId: 1,
    creatorName: "John Doe",

    image: null,

    maxParticipants: 10,
    registrationDeadline: "2026-12-19T12:00:00.000Z",

    participantCount: 2,

    status: EVENT_STATUS.UPCOMING,

    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-02T10:00:00.000Z",

    ...overrides
});

/* =============================
   PAGINATED PAYLOADS
============================= */

// Generate a paginated events payload
export const createPaginatedEventsPayload = (overrides = {}) => ({
    events: [
        createEvent()
    ],

    page: 1,
    pageSize: 10,

    totalEvents: 1,
    totalPages: 1,

    message: "Events retrieved",
    success: true,

    ...overrides
});

/* =============================
   FORM DATA
============================= */

// Generate event form data
export const createEventFormData = (overrides = {}) => ({
    title: "Test Event",
    description: "A test event",

    type: "Meetup",
    theme: "Tech",

    mode: EVENT_MODES.IN_PERSON,
    location: "Montreal",

    startDateTime: "2026-12-20T10:00:00.000Z",
    endDateTime: "2026-12-20T12:00:00.000Z",

    maxParticipants: "10",
    registrationDeadline: "2026-12-19T12:00:00.000Z",

    image: null,

    ...overrides
});
