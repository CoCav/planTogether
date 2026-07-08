/* ==========================================================================
   Event Review Test Factory

   Builds reusable event review test data.

   Responsibilities
   - Build review payloads
   - Build serialized review responses
   - Build Sequelize-like review model mocks
   - Support flexible test overrides

   Notes
   - Shared across review service, controller and validator tests.
=========================================================================== */

const createReviewPayload = (overrides = {}) => ({
    rating: 5,
    comment: "This was a great event.",
    ...overrides
});

const createMockReview = (overrides = {}) => ({
    id: 1,
    eventId: 1,
    userId: 1,
    rating: 5,
    comment: "This was a great event.",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    update: jest.fn(),
    destroy: jest.fn(),
    ...overrides
});

const createReviewResponse = (overrides = {}) => ({
    id: 1,
    eventId: 1,
    userId: 1,
    rating: 5,
    comment: "This was a great event.",
    user: {
        id: 1,
        name: "John Doe",
        avatar: null
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides
});

module.exports = {
    createReviewPayload,
    createMockReview,
    createReviewResponse
};
