/* ==================================================
   EVENT TEST FACTORY

   Handles:
   - valid event payload generation
   - reusable event test data
   - mock Sequelize-like event instances

   Notes:
   - shared across unit and integration tests
   - accepts overrides for flexible scenarios
   - createEventPayload returns API-valid request data
================================================== */

// Generate a valid API event payload with optional overrides
const createEventPayload = (overrides = {}) => ({
    title: "Test Event",
    description: "This is a test event",
    type: "Meetup",
    theme: "Technology",
    mode: "in_person",
    location: "Montreal",

    startDateTime: "2026-12-31T10:00:00.000Z",
    endDateTime: "2026-12-31T12:00:00.000Z",

    ...overrides
});

// Generate a mock Sequelize-like event instance
const createMockEvent = (overrides = {}) => ({
    id: 1,
    title: "Test Event",
    description: "This is a test event",
    type: "Meetup",
    theme: "Technology",
    mode: "in_person",
    location: "Montreal",

    startDateTime: "2026-12-31T10:00:00.000Z",
    endDateTime: "2026-12-31T12:00:00.000Z",

    maxParticipants: null,
    registrationDeadline: null,
    image: null,

    update: jest.fn(),
    destroy: jest.fn(),

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            type: this.type,
            theme: this.theme,
            mode: this.mode,
            location: this.location,

            startDateTime: this.startDateTime,
            endDateTime: this.endDateTime,

            maxParticipants: this.maxParticipants,
            registrationDeadline: this.registrationDeadline,
            image: this.image
        };
    },

    ...overrides
});

module.exports = { createEventPayload, createMockEvent };
