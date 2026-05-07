/* ==================================================
   USER INTEGRATION - CURRENT USER PASSWORD

   Tests:
   - successful password update
   - missing token rejection
   - invalid token rejection
   - wrong current password rejection
   - same password rejection
   - weak new password rejection
   - login with new password after update

   Ensures:
   - authentication middleware protects password update
   - current password is verified
   - new password rules are enforced
   - password update is persisted correctly
================================================== */

const request = require("supertest");
const app = require("../../../src/app");

const { initDB, sequelize, User, Event, EventUserRole } = require("../../../src/models");

const { registerAndGetToken } = require("../../helpers/authHelper");

describe("Current User Password API", () => {
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
       PASSWORD UPDATE SUCCESS
    ============================= */

    it("should change password correctly", async () => {
        const userAuth = await registerAndGetToken({
            name: "User",
            email: `pass${Date.now()}@test.com`,
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

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    it("should reject without token", async () => {
        const res = await request(app)
            .put("/api/users/me/password")
            .send({
                currentPassword: "Password123",
                newPassword: "NewPassword123"
            });

        expect(res.statusCode).toBe(401);
    });

    it("should reject invalid token", async () => {
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
       BUSINESS RULES
    ============================= */

    it("should reject wrong current password", async () => {
        const userAuth = await registerAndGetToken({
            name: "User",
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

    it("should reject same password", async () => {
        const userAuth = await registerAndGetToken({
            name: "User",
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

    /* =============================
       VALIDATION ERRORS
    ============================= */

    it("should reject weak new password", async () => {
        const userAuth = await registerAndGetToken({
            name: "User",
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
       PASSWORD PERSISTENCE
    ============================= */

    it("should allow login with new password and reject old one", async () => {
        const email = `verify${Date.now()}@test.com`;

        const userAuth = await registerAndGetToken({
            name: "User",
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

        const oldLogin = await request(app)
            .post("/api/auth/login")
            .send({
                email,
                password: "Password123"
            });

        expect(oldLogin.statusCode).toBe(401);

        const newLogin = await request(app)
            .post("/api/auth/login")
            .send({
                email,
                password: "NewPassword123"
            });

        expect(newLogin.statusCode).toBe(200);
    });
});
