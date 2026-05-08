/* ==================================================
   USER INTEGRATION - CURRENT USER PROFILE TESTS

   Tests:
   - authenticated current profile retrieval
   - authentication protection

   Ensures:
   - authenticated users can retrieve their profile
   - password is never exposed
   - authentication middleware protects the route
================================================== */

const request = require("supertest");
const app = require("../../../../src/app");

const { initDB, sequelize, User, Event, EventUserRole } = require("../../../../src/models");

const { registerAndGetToken } = require("../../../helpers/authHelper");

describe("Get Current User Profile API", () => {

    beforeAll(async () => {
        await initDB();
    });

    afterEach(async () => {
        await EventUserRole.destroy({ where: {} });
        await Event.destroy({ where: {} });
        await User.destroy({ where: {} });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    /* =============================
       CURRENT USER PROFILE SUCCESS
    ============================= */

    it("should get current authenticated user profile", async () => {
        const userAuth = await registerAndGetToken({
            name: "Profile User",
            email: `profile${Date.now()}@test.com`
        });

        const res = await request(app)
            .get("/api/users/me")
            .set(userAuth.headers);

        expect(res.statusCode).toBe(200);

        expect(res.body).toHaveProperty(
            "message",
            "User profile retrieved successfully"
        );

        expect(res.body).toHaveProperty("user");

        expect(res.body.user).toMatchObject({
            name: "Profile User",
            email: userAuth.email
        });

        expect(res.body.user).not.toHaveProperty("password");
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    it("should reject getting current profile without token", async () => {
        const res = await request(app).get("/api/users/me");

        expect(res.statusCode).toBe(401);
    });
});
