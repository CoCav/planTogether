import { createAuthenticatedUser } from "../users/userFactory";

/* ==================================================
   AUTH TEST FACTORY

   Handles:
   - auth payload generation
   - auth context generation

   Notes:
   - shared across frontend unit and component tests
   - accepts overrides for flexible scenarios
================================================== */

/* =============================
   AUTH PAYLOADS
============================= */

// Generate an authentication API payload
export const createAuthPayload = (overrides = {}) => ({
    success: true,
    message: "Login successful",

    user: createAuthenticatedUser(),

    token: "jwt-token",

    ...overrides
});

/* =============================
   AUTH CONTEXT
============================= */

// Generate an auth context value
export const createAuthContextValue = (overrides = {}) => ({
    user: createAuthenticatedUser(),

    loading: false,

    login: () => { },
    logout: () => { },
    refreshUser: () => { },

    ...overrides
});
