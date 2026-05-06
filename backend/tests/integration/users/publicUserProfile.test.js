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
       HELPERS
    ============================= */

    // Register a test user and return auth token
    const registerAndGetToken = async (name, email) => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name,
                email,
                password: "Password123"
            });

        return res.body.token;
    };

    /* =============================
       PUBLIC PROFILE RETRIEVAL
    ============================= */

    it("should get public user profile when authenticated", async () => {
        const token = await registerAndGetToken(
            "Viewer",
            `viewer${Date.now()}@test.com`
        );

        const target = await User.create({
            name: "Target User",
            email: `target${Date.now()}@test.com`,
            password: "Password123",
            avatar: "/uploads/avatars/test.png"
        });

        const res = await request(app)
            .get(`/api/users/${target.id}`)
            .set("Authorization", `Bearer ${token}`);

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
        const user = await User.create({
            name: "Test User",
            email: `test${Date.now()}@test.com`,
            password: "Password123"
        });

        const res = await request(app)
            .get(`/api/users/${user.id}`);

        expect(res.statusCode).toBe(401);
    });

    it("should reject invalid user ID", async () => {
        const token = await registerAndGetToken(
            "Viewer",
            `viewer${Date.now()}@test.com`
        );

        const res = await request(app)
            .get("/api/users/abc")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(400);
    });

    it("should return 404 if user does not exist", async () => {
        const token = await registerAndGetToken(
            "Viewer",
            `viewer${Date.now()}@test.com`
        );

        const res = await request(app)
            .get("/api/users/999999")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(404);
    });
});
