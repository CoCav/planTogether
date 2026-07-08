/* ==========================================================================
   User Test Factory

   Builds reusable user test data.

   Responsibilities
   - Build mock public user data
   - Build mock authenticated user data
   - Build mock users with passwords
   - Support flexible test overrides

   Notes
   - Shared across unit and integration tests.
   - Password is included only when explicitly needed.
=========================================================================== */

const createMockUser = (overrides = {}) => ({
    id: 1,
    name: "John Doe",
    email: "john@test.com",
    avatar: null,
    ...overrides
});

const createMockPublicUser = (overrides = {}) => ({
    name: "John Doe",
    avatar: null,
    ...overrides
});

const createMockUserWithPassword = (overrides = {}) => ({
    ...createMockUser(),
    password: "hashed-password",
    ...overrides
});

module.exports = {
    createMockUser,
    createMockPublicUser,
    createMockUserWithPassword
};
