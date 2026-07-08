const { EVENT_ROLES } = require("../../src/constants/eventRoles");

/* ==========================================================================
   Event Membership Test Factory

   Builds reusable event membership test data.

   Responsibilities
   - Build minimal event mocks for membership tests
   - Build active membership records
   - Build soft-deleted membership records
   - Support authorization test scenarios
   - Support flexible test overrides

   Notes
   - Shared across membership and authorization tests.
   - deletedAt defaults to null for active memberships.
=========================================================================== */

const createMockMembershipEvent = (overrides = {}) => ({
    id: 1,
    creatorId: 99,
    maxParticipants: null,
    registrationDeadline: null,
    startDateTime: "2026-12-31T10:00:00.000Z",
    endDateTime: "2026-12-31T12:00:00.000Z",
    ...overrides
});

const createMockMembership = (overrides = {}) => ({
    id: 1,
    eventId: 1,
    userId: 1,
    role: EVENT_ROLES.PARTICIPANT,
    joinedAt: "2026-01-01T00:00:00.000Z",
    deletedAt: null,
    save: jest.fn(),
    destroy: jest.fn(),
    ...overrides
});

const createMockDeletedMembership = (overrides = {}) => (
    createMockMembership({
        deletedAt: "2026-01-01T00:00:00.000Z",
        ...overrides
    })
);

module.exports = {
    createMockMembershipEvent,
    createMockMembership,
    createMockDeletedMembership
};
