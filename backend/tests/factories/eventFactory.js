/* ==================================================
   EVENT TEST FACTORY

   Handles:
   - valid event payload generation
   - reusable event test data

   Notes:
   - shared across tests
   - accepts overrides for flexible scenarios
================================================== */

// Generate a valid event payload with optional overrides
const createEventPayload = (overrides = {}) => ({
    title: "Test Event",
    description: "This is a test event",
    startDateTime: "2026-12-31T10:00:00.000Z",
    endDateTime: "2026-12-31T12:00:00.000Z",
    mode: "in_person",
    location: "Montreal",
    type: "Meetup",
    theme: "Technology",
    ...overrides
});

// Generate a mock event
const createMockEvent = (overrides = {}) => ({
    toJSON: () => ({
        id: 1,
        title: "Test Event",
        ...overrides
    })
});

module.exports = { createEventPayload, createMockEvent };
