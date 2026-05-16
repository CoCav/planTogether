/* ==================================================
   USER TEST FACTORY

   Handles:
   - authenticated user generation
   - public user generation
   - public user statistics generation

   Notes:
   - shared across frontend unit and component tests
   - accepts overrides for flexible scenarios
================================================== */

/* =============================
   AUTHENTICATED USERS
============================= */

// Generate an authenticated user object
export const createAuthenticatedUser = (overrides = {}) => ({
    userId: 1,
    name: "John Doe",
    email: "john@test.com",
    avatar: null,

    ...overrides
});

/* =============================
   PUBLIC USERS
============================= */

// Generate a public user object
export const createPublicUser = (overrides = {}) => ({
    name: "John Doe",
    avatar: null,

    ...overrides
});

/* =============================
   PUBLIC USER STATS
============================= */

// Generate public user statistics
export const createPublicUserStats = (overrides = {}) => ({
    createdEventsCount: 2,
    joinedEventsCount: 3,

    ...overrides
});
