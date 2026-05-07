/* ==================================================
   USER INTEGRATION - PUBLIC USER PROFILE

   Tests:
   - authenticated public profile retrieval
   - invalid user ID validation
   - authentication protection
   - nonexistent user handling
   - sensitive data protection

   Ensures:
   - public user profiles are correctly retrieved
   - private user fields are never exposed
   - authentication and validators protect the route
================================================== */

const request = require("supertest");
const app = require("../../../src/app");

const { initDB, sequelize, User, Event, EventUserRole } = require("../../../src/models");

const { registerAndGetToken } = require("../../helpers/authHelper");

describe("Public User Profile API", () => {
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
       PUBLIC PROFILE RETRIEVAL
    ============================= */

    it("should get public user profile when authenticated", async () => {
        const viewerAuth = await registerAndGetToken({
            name: "Viewer",
            email: `viewer${Date.now()}@test.com`
        });

        const targetUser = await User.create({
            name: "Target User",
            email: `target${Date.now()}@test.com`,
            password: "Password123",
            avatar: "/uploads/avatars/test.png"
        });

        const res = await request(app)
            .get(`/api/users/${targetUser.id}`)
            .set(viewerAuth.headers);

        expect(res.statusCode).toBe(200);

        expect(res.body).toHaveProperty("user");
        expect(res.body).toHaveProperty("stats");

        expect(res.body.user).toMatchObject({
            name: "Target User",
            avatar: "/uploads/avatars/test.png"
        });

        // Ensure sensitive data is never exposed publicly
        expect(res.body.user).not.toHaveProperty("id");
        expect(res.body.user).not.toHaveProperty("email");
        expect(res.body.user).not.toHaveProperty("password");
        expect(res.body.user).not.toHaveProperty("createdAt");
        expect(res.body.user).not.toHaveProperty("updatedAt");
    });

    /* =============================
       AUTHENTICATION & VALIDATION
    ============================= */

    it("should reject unauthenticated request", async () => {
        const targetUser = await User.create({
            name: "Test User",
            email: `test${Date.now()}@test.com`,
            password: "Password123"
        });

        const res = await request(app).get(`/api/users/${targetUser.id}`);

        expect(res.statusCode).toBe(401);
    });

    it("should reject invalid user ID", async () => {
        const viewerAuth = await registerAndGetToken({
            name: "Viewer",
            email: `viewer${Date.now()}@test.com`
        });

        const res = await request(app)
            .get("/api/users/abc")
            .set(viewerAuth.headers);

        expect(res.statusCode).toBe(400);
    });

    it("should return 404 if user does not exist", async () => {
        const viewerAuth = await registerAndGetToken({
            name: "Viewer",
            email: `viewer${Date.now()}@test.com`
        });

        const res = await request(app)
            .get("/api/users/999999")
            .set(viewerAuth.headers);

        expect(res.statusCode).toBe(404);
    });
});
