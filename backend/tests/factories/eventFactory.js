const { EVENT_MODES } = require("../../src/constants/eventModes");

/* ==========================================================================
   Event Test Factory

   Builds reusable event test data.

   Responsibilities
   - Build valid event request payloads
   - Build serialized event responses
   - Build Sequelize-like event model mocks
   - Support structured location test fields
   - Support flexible test overrides

   Notes
   - Shared across unit and integration tests.
   - createEventPayload returns API-valid request data.
   - createEventResponse returns serialized event data.
=========================================================================== */

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

const createEventResponse = (overrides = {}) => ({
    id: 1,
    creatorId: 1,

    title: "Test Event",
    description: "This is a test event",
    type: "Meetup",
    theme: "Technology",

    mode: EVENT_MODES.IN_PERSON,
    location: "Montreal",

    locationLabel: null,
    streetAddress: null,
    city: null,
    region: null,
    postalCode: null,
    country: null,
    latitude: null,
    longitude: null,

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

    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",

    ...overrides
});

const createMockEventModel = (overrides = {}) => {
    const event = {
        ...createEventResponse(),
        update: jest.fn(),
        save: jest.fn(),
        destroy: jest.fn(),

        toJSON() {
            const {
                update,
                save,
                destroy,
                toJSON,
                ...data
            } = this;

            return data;
        },

        ...overrides
    };

    return event;
};

module.exports = {
    createEventPayload,
    createEventResponse,
    createMockEventModel
};
