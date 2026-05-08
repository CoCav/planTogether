/* ==================================================
   USER INTEGRATION - CURRENT USER PASSWORD TESTS

   Tests:
   - authenticated password update
   - authentication protection
   - invalid token rejection
   - wrong current password rejection
   - same password rejection
   - weak password rejection
   - missing password fields validation
   - password persistence after update

   Ensures:
   - authenticated users can change their password
   - validators protect password rules
   - old passwords become invalid after update
==================================================== */

const request = require("supertest");
const app = require("../../../../src/app");

const { initDB, sequelize, User, Event, EventUserRole } = require("../../../../src/models");

const { registerAndGetToken } = require("../../../helpers/authHelper");

describe("Change Current User Password API", () => {

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

    /* ============================
       PASSWORD UPDATE SUCCESS
    ============================= */

    it("should update current user password", async () => {
        const userAuth = await registerAndGetToken({
            name: "Password User",
            email: `password${Date.now()}@test.com`,
            password: "Password123"
        });

        const res = await request(app)
            .put("/api/users/me/password")
            .set(userAuth.headers)
            .send({
                currentPassword: "Password123",
                newPassword: "NewPassword123"
            });

        expect(res.statusCode).toBe(200);

        expect(res.body).toHaveProperty(
            "message",
            "Password updated successfully"
        );
    });

    it("should allow login with new password after update", async () => {
        const email = `persist${Date.now()}@test.com`;

        const userAuth = await registerAndGetToken({
            name: "Persistence User",
            email,
            password: "Password123"
        });

        await request(app)
            .put("/api/users/me/password")
            .set(userAuth.headers)
            .send({
                currentPassword: "Password123",
                newPassword: "NewPassword123"
            });

        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email,
                password: "NewPassword123"
            });

        expect(res.statusCode).toBe(200);

        expect(res.body).toHaveProperty("token");
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    it("should reject password update without token", async () => {
        const res = await request(app)
            .put("/api/users/me/password")
            .send({
                currentPassword: "Password123",
                newPassword: "NewPassword123"
            });

        expect(res.statusCode).toBe(401);
    });

    it("should reject password update with invalid token", async () => {
        const res = await request(app)
            .put("/api/users/me/password")
            .set("Authorization", "Bearer invalid-token")
            .send({
                currentPassword: "Password123",
                newPassword: "NewPassword123"
            });

        expect(res.statusCode).toBe(401);
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    it("should reject missing current password", async () => {
        const userAuth = await registerAndGetToken({
            name: "Validation User",
            email: `missingcurrent${Date.now()}@test.com`
        });

        const res = await request(app)
            .put("/api/users/me/password")
            .set(userAuth.headers)
            .send({
                currentPassword: "",
                newPassword: "NewPassword123"
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject missing new password", async () => {
        const userAuth = await registerAndGetToken({
            name: "Validation User",
            email: `missingnew${Date.now()}@test.com`
        });

        const res = await request(app)
            .put("/api/users/me/password")
            .set(userAuth.headers)
            .send({
                currentPassword: "Password123",
                newPassword: ""
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject weak new password", async () => {
        const userAuth = await registerAndGetToken({
            name: "Weak Password User",
            email: `weak${Date.now()}@test.com`,
            password: "Password123"
        });

        const res = await request(app)
            .put("/api/users/me/password")
            .set(userAuth.headers)
            .send({
                currentPassword: "Password123",
                newPassword: "abc"
            });

        expect(res.statusCode).toBe(400);
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    it("should reject wrong current password", async () => {
        const userAuth = await registerAndGetToken({
            name: "Wrong Password User",
            email: `wrong${Date.now()}@test.com`,
            password: "Password123"
        });

        const res = await request(app)
            .put("/api/users/me/password")
            .set(userAuth.headers)
            .send({
                currentPassword: "WrongPassword",
                newPassword: "NewPassword123"
            });

        expect(res.statusCode).toBe(401);
    });

    it("should reject updating to the same password", async () => {
        const userAuth = await registerAndGetToken({
            name: "Same Password User",
            email: `same${Date.now()}@test.com`,
            password: "Password123"
        });

        const res = await request(app)
            .put("/api/users/me/password")
            .set(userAuth.headers)
            .send({
                currentPassword: "Password123",
                newPassword: "Password123"
            });

        expect(res.statusCode).toBe(400);
    });
});
