const {
    initializeTestDatabase,
    resetTestDatabase,
    closeTestDatabase
} = require("../../helpers/database/dbTestHelper");

const {
    registerAndAuthenticateUser,
    logoutUser
} = require("../../helpers/http/authTestHelper");

/* ==========================================================================
   Auth Integration Tests - Logout

   Tests user logout behavior.

   Responsibilities
   - Test authenticated logout
   - Test missing token rejection
   - Test invalid token rejection

   Notes
   - Logout is stateless because authentication uses JWT.
   - Authentication middleware protects the logout route.
=========================================================================== */

describe("Logout API", () => {
    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* =============================
       LOGOUT SUCCESS
    ============================= */

    describe("Logout success", () => {
        it("logs out an authenticated user", async () => {
            const userAuth = await registerAndAuthenticateUser({
                name: "Logout User",
                email: `logout${Date.now()}@test.com`
            });

            const response = await logoutUser(userAuth.headers);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "Logout successful");
        });
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    describe("Authentication errors", () => {
        it("rejects logout without token", async () => {
            const response = await logoutUser();

            expect(response.statusCode).toBe(401);
        });

        it("rejects logout with invalid token", async () => {
            const response = await logoutUser({
                Authorization: "Bearer invalid-token"
            });

            expect(response.statusCode).toBe(401);
        });
    });
});
