/* ==================================================
   EVENT MEMBERSHIP TEST FACTORY

   Handles:
   - minimal event mocks for membership logic
   - mock membership records
   - reusable authorization test data

   Notes:
   - shared across membership and authorization tests
   - accepts overrides for flexible scenarios
================================================== */

// Generate a minimal mock event used in membership
// and authorization-related unit tests
const createMockMembershipEvent = (overrides = {}) => ({
    id: 1,
    creatorId: 99,
    ...overrides
});

// Generate a mock membership record linking a user to an event
const createMockMembership = (overrides = {}) => ({
    eventId: 1,
    userId: 1,
    role: "participant",
    ...overrides
});

module.exports = { createMockMembershipEvent, createMockMembership };
