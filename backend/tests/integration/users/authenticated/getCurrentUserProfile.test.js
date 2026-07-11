const {
    initializeTestDatabase,
    resetTestDatabase,
    closeTestDatabase
} = require("../../../helpers/database/dbTestHelper");

const { registerAndAuthenticateUser } = require("../../../helpers/http/authTestHelper");
const { getCurrentUserProfile } = require("../../../helpers/http/userTestHelper");

/* ==========================================================================
   Users Integration Tests - Get Current User Profile

   Tests current user profile retrieval.

   Responsibilities
   - Test authenticated profile retrieval
   - Test authentication errors

   Notes
   - Authenticated users can retrieve their own profile.
   - Passwords must never be exposed in profile responses.
=========================================================================== */

describe("Get Current User Profile API", () => {
    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* =============================
       PROFILE RETRIEVAL SUCCESS
    ============================= */

    describe("Profile retrieval success", () => {
        it("retrieves the authenticated user's profile", async () => {
            const userAuth = await registerAndAuthenticateUser({
                name: "Profile User",
                email: `profile${Date.now()}@test.com`
            });

            const response = await getCurrentUserProfile(userAuth.headers);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "User profile retrieved successfully");
            expect(response.body).toHaveProperty("user");

            expect(response.body.user).toMatchObject({
                name: "Profile User",
                email: userAuth.email
            });

            expect(response.body.user).not.toHaveProperty("password");
        });
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    describe("Authentication errors", () => {
        it("rejects profile retrieval without authentication", async () => {
            const response = await getCurrentUserProfile();

            expect(response.statusCode).toBe(401);
        });
    });
});
