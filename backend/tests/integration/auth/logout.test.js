/* ==================================================
   AUTH INTEGRATION - LOGOUT TESTS

   Tests:
   - authenticated logout
   - missing token rejection
   - invalid token rejection

   Ensures:
   - authentication middleware protects logout route
   - valid tokens can access the endpoint
   - invalid or missing tokens are rejected
   - logout remains stateless with JWT authentication

   Notes:
   - logout is stateless because authentication uses JWT
================================================== */

const request = require("supertest");
const app = require("../../../src/app");

const { initializeTestDatabase, resetTestDatabase, closeTestDatabase } = require("../../helpers/database/dbTestHelper");

const { registerAndAuthenticateUser } = require("../../helpers/http/authTestHelper");

describe("Logout API", () => {

    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* =============================
       LOGOUT SUCCESS
    ============================= */

    it("should logout authenticated user", async () => {
        const userAuth = await registerAndAuthenticateUser({
            name: "Logout User",
            email: `logout${Date.now()}@test.com`
        });

        const res = await request(app)
            .post("/api/auth/logout")
            .set(userAuth.headers);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Logout successful");
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    it("should reject without token", async () => {
        const res = await request(app)
            .post("/api/auth/logout");

        expect(res.statusCode).toBe(401);
    });

    it("should reject invalid token", async () => {
        const res = await request(app)
            .post("/api/auth/logout")
            .set("Authorization", "Bearer invalid-token");

        expect(res.statusCode).toBe(401);
    });
});
