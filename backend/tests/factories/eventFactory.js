const { EVENT_MODES } = require("../../src/constants/eventModes");

/* ==================================================
   EVENT TEST FACTORY

   Handles:
   - valid event payload generation
   - serialized event response generation
   - mock Sequelize-like event model generation

   Notes:
   - shared across unit and integration tests
   - accepts overrides for flexible scenarios
   - createEventPayload returns API-valid request data
   - createEventResponse returns serialized event data
   - createMockEventModel simulates Sequelize model instances
================================================== */

// Generate a valid API event payload
const createEventPayload = (overrides = {}) => ({
    title: "Test Event",
    description: "This is a test event",
    type: "Meetup",
    theme: "Technology",

    mode: EVENT_MODES.IN_PERSON,
    location: "Montreal",

    startDateTime: "2026-12-31T10:00:00.000Z",
    endDateTime: "2026-12-31T12:00:00.000Z",

    ...overrides
});

// Generate serialized event response data
const createEventResponse = (overrides = {}) => ({
    id: 1,
    title: "Test Event",
    description: "This is a test event",
    type: "Meetup",
    theme: "Technology",

    mode: EVENT_MODES.IN_PERSON,
    location: "Montreal",

    startDateTime: "2026-12-31T10:00:00.000Z",
    endDateTime: "2026-12-31T12:00:00.000Z",

    maxParticipants: null,
    registrationDeadline: null,
    image: null,

    participantCount: 0,

    likesCount: 0,
    isLikedByCurrentUser: false,

    reviewCount: 0,
    averageRating: null,

    ...overrides
});

// Generate a mock Sequelize-like event model instance
const createMockEventModel = (overrides = {}) => ({
    ...createEventResponse(),

    update: jest.fn(),
    destroy: jest.fn(),

    toJSON() {
        return createEventResponse({
            ...this
        });
    },

    ...overrides
});

module.exports = { createEventPayload, createEventResponse, createMockEventModel };
