const request = require("supertest");
const app = require("../../../src/app");
const { initDB, sequelize, User, Event, EventUserRole } = require("../../../src/models");

/* ==================================================
   USER INTEGRATION - GET PUBLIC USER PROFILE

   These tests validate public user profile retrieval via HTTP.

   What is tested:
   - Authenticated user can view another user's profile
   - Request validation (invalid ID)
   - Authentication protection
   - Handling of nonexistent users
   - Response structure and data privacy

   Integration scope:
   → Routes + Middleware + Controller + Service + Database

   Goal:
   Ensure the public user profile endpoint works correctly
   end-to-end and does not expose sensitive data.
================================================== */

describe("Get Public User Profile API", () => {

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

    /* =========================
       Helpers
    ========================= */

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

    /* =========================
       Tests
    ========================= */

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

        // 🔒 Ensure sensitive data is NOT exposed
        expect(res.body.user).not.toHaveProperty("id");
        expect(res.body.user).not.toHaveProperty("email");
        expect(res.body.user).not.toHaveProperty("password");
        expect(res.body.user).not.toHaveProperty("createdAt");
        expect(res.body.user).not.toHaveProperty("updatedAt");
    });

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
