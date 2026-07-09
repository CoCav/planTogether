/* ==========================================================================
   User Test Factory

   Builds reusable user objects and authentication payloads.

   Responsibilities
   - Build mock public user data
   - Build mock authenticated user data
   - Build mock users with passwords
   - Build registration request payloads
   - Build login request payloads
   - Support flexible test overrides

   Notes
   - Shared across unit and integration tests.
   - Password is included only when explicitly needed.
   - Payload helpers generate API-valid request bodies.
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

const createRegistrationPayload = (overrides = {}) => ({
    name: "Test User",
    email: `user${Date.now()}@test.com`,
    password: "Password123",
    ...overrides
});

const createLoginPayload = (overrides = {}) => {
    const { email, password } = createRegistrationPayload(overrides);

    return {
        email,
        password
    };
};

module.exports = {
    createMockUser,
    createMockPublicUser,
    createMockUserWithPassword,
    createRegistrationPayload,
    createLoginPayload
};
