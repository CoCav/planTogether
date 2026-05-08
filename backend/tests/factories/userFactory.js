/* ==================================================
   USER TEST FACTORY

   Handles:
   - mock user generation
   - reusable authenticated user test data

   Notes:
   - shared across unit and integration tests
   - accepts overrides for flexible scenarios
================================================== */

// Generate a mock user object
const createMockUser = (overrides = {}) => ({
    id: 1,
    name: "John Doe",
    email: "john@test.com",
    avatar: null,
    ...overrides
});

// Generate a mock user object including password
const createMockUserWithPassword = (overrides = {}) => ({
    ...createMockUser(),
    password: "hashed-password",
    ...overrides
});

module.exports = { createMockUser, createMockUserWithPassword };
