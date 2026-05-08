/* ==================================================
   MEMBERSHIP TEST FACTORY

   Handles:
   - mock event generation
   - mock event membership generation
   - reusable event authorization test data

   Notes:
   - shared across unit tests
   - accepts overrides for flexible scenarios
================================================== */

// Generate a mock event
const createMockEvent = (overrides = {}) => ({
    id: 1,
    creatorId: 99,
    ...overrides
});

// Generate a mock event membership
const createMockMembership = (overrides = {}) => ({
    eventId: 1,
    userId: 1,
    role: "participant",
    ...overrides
});

module.exports = { createMockEvent, createMockMembership };
