/* ==========================================================================
   Event Like Test Factory

   Builds reusable event like test data.

   Responsibilities
   - Build like payloads
   - Build Sequelize-like like model mocks
   - Build serialized like responses
   - Support flexible test overrides

   Notes
   - Shared across like service and controller tests.
=========================================================================== */

const createMockLike = (overrides = {}) => ({
    id: 1,
    eventId: 1,
    userId: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",

    destroy: jest.fn(),

    ...overrides
});

const createLikeResponse = (overrides = {}) => ({
    eventId: 1,
    userId: 1,
    liked: true,
    likesCount: 1,

    ...overrides
});

const createUnlikeResponse = (overrides = {}) => ({
    eventId: 1,
    userId: 1,
    liked: false,
    likesCount: 0,

    ...overrides
});

module.exports = {
    createMockLike,
    createLikeResponse,
    createUnlikeResponse
};
