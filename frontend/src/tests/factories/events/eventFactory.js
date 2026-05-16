import { EVENT_MODES } from "../../../features/shared/eventModes";
import { EVENT_STATUS } from "../../../features/shared/eventStatus";

/* ==================================================
   EVENT TEST FACTORY

   Handles:
   - event object generation
   - paginated event payload generation
   - event form data generation

   Notes:
   - shared across frontend unit and component tests
   - accepts overrides for flexible scenarios
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
