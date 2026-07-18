const {
    initializeTestDatabase,
    resetTestDatabase,
    closeTestDatabase
} = require("../../../helpers/database/dbTestHelper");

const {
    registerAndAuthenticateUser,
    loginUser,
    updateCurrentUserPassword
} = require("../../../helpers/http/authTestHelper");

/* ==========================================================================
   Users Integration Tests - Change Current User Password

   Tests current user password updates.

   Responsibilities
   - Test successful password updates
   - Test authentication errors
   - Test validation errors
   - Test password business rules
   - Test password persistence

   Notes
   - Password updates require the current password.
   - Old passwords become invalid after update.
=========================================================================== */

describe("Change Current User Password API", () => {
    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* =============================
       PASSWORD UPDATE SUCCESS
    ============================= */

    describe("Password update success", () => {
        it("updates the authenticated user's password", async () => {
            const userAuth = await registerAndAuthenticateUser({
                name: "Password User",
                email: `password${Date.now()}@test.com`,
                password: "Password123"
            });

            const response = await updateCurrentUserPassword(userAuth.headers, {
                currentPassword: "Password123",
                newPassword: "NewPassword123"
            });

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "Password updated successfully");
        });
    });

    /* =============================
       PASSWORD PERSISTENCE
    ============================= */

    describe("Password persistence", () => {
        it("allows login with the new password", async () => {
            const email = `persist${Date.now()}@test.com`;

            const userAuth = await registerAndAuthenticateUser({
                name: "Persistence User",
                email,
                password: "Password123"
            });

            await updateCurrentUserPassword(userAuth.headers, {
                currentPassword: "Password123",
                newPassword: "NewPassword123"
            });

            const response = await loginUser({
                email,
                password: "NewPassword123"
            });

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "Login successful");
            expect(response.body).toHaveProperty("token");
        });
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    describe("Authentication errors", () => {
        it("rejects password updates without authentication", async () => {
            const response = await updateCurrentUserPassword({}, {
                currentPassword: "Password123",
                newPassword: "NewPassword123"
            });

            expect(response.statusCode).toBe(401);
        });

        it("rejects invalid authentication tokens", async () => {
            const response = await updateCurrentUserPassword({
                Authorization: "Bearer invalid-token"
            }, {
                currentPassword: "Password123",
                newPassword: "NewPassword123"
            });

            expect(response.statusCode).toBe(401);
        });
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    describe("Validation errors", () => {
        it("rejects missing current password", async () => {
            const userAuth = await registerAndAuthenticateUser({
                name: "Validation User",
                email: `missingcurrent${Date.now()}@test.com`
            });

            const response = await updateCurrentUserPassword(userAuth.headers, {
                currentPassword: "",
                newPassword: "NewPassword123"
            });

            expect(response.statusCode).toBe(400);
        });

        it("rejects missing new password", async () => {
            const userAuth = await registerAndAuthenticateUser({
                name: "Validation User",
                email: `missingnew${Date.now()}@test.com`
            });

            const response = await updateCurrentUserPassword(userAuth.headers, {
                currentPassword: "Password123",
                newPassword: ""
            });

            expect(response.statusCode).toBe(400);
        });

        it("rejects weak new passwords", async () => {
            const userAuth = await registerAndAuthenticateUser({
                name: "Weak Password User",
                email: `weak${Date.now()}@test.com`,
                password: "Password123"
            });

            const response = await updateCurrentUserPassword(userAuth.headers, {
                currentPassword: "Password123",
                newPassword: "abc"
            });

            expect(response.statusCode).toBe(400);
        });
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    describe("Business rules", () => {
        it("rejects incorrect current password", async () => {
            const userAuth = await registerAndAuthenticateUser({
                name: "Wrong Password User",
                email: `wrong${Date.now()}@test.com`,
                password: "Password123"
            });

            const response = await updateCurrentUserPassword(userAuth.headers, {
                currentPassword: "WrongPassword",
                newPassword: "NewPassword123"
            });

            expect(response.statusCode).toBe(401);
        });

        it("rejects updating to the current password", async () => {
            const userAuth = await registerAndAuthenticateUser({
                name: "Same Password User",
                email: `same${Date.now()}@test.com`,
                password: "Password123"
            });

            const response = await updateCurrentUserPassword(userAuth.headers, {
                currentPassword: "Password123",
                newPassword: "Password123"
            });

            expect(response.statusCode).toBe(400);
        });
    });
});
