/* ==================================================
   USER INTEGRATION - DELETE CURRENT USER TESTS

   Tests:
   - authenticated account deletion
   - authentication protection
   - active organizer deletion rejection
   - past organizer deletion allowance
   - deleted account login rejection

   Ensures:
   - authenticated users can delete their account
   - deleted users remain visible for history
   - deleted users cannot login again
   - active or upcoming organizer ownership must be transferred first
   - account deletion anonymizes email and removes avatar data
================================================== */

const request = require("supertest");
const app = require("../../../../src/app");

const User = require("../../../../src/models/userModel");

const { initDB, resetDB, closeDB } = require("../../../helpers/database/dbTestHelper");

const { registerAndGetToken } = require("../../../helpers/api/authHelper");
const { createEventWithOrganizer } = require("../../../helpers/api/eventHelper");

describe("Delete Current User API", () => {

    beforeAll(initDB);
    afterEach(resetDB);
    afterAll(closeDB);

    /* =============================
       ACCOUNT DELETION SUCCESS
    ============================= */

    it("should delete current authenticated user account", async () => {
        const userAuth = await registerAndGetToken({
            name: "Deleted User",
            email: `deleted${Date.now()}@test.com`,
            password: "Password123"
        });

        const res = await request(app)
            .delete("/api/users/me")
            .set(userAuth.headers);

        const deletedUser = await User.scope("withPassword").findByPk(userAuth.user.userId);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Account deleted successfully");

        expect(deletedUser).not.toBeNull();
        expect(deletedUser.deletedAt).not.toBeNull();
        expect(deletedUser.name).toBe("Deleted User");
        expect(deletedUser.email).toMatch(/^deleted_user_/);
        expect(deletedUser.avatar).toBeNull();
        expect(deletedUser.password).toBeDefined();
    });

    it("should allow deleting account when organizer only owns past events", async () => {
        const { organizerAuth } = await createEventWithOrganizer({
            organizer: {
                name: "Past Organizer",
                email: `pastorganizer${Date.now()}@test.com`
            },
            event: {
                startDateTime: "2020-01-01T10:00:00.000Z",
                endDateTime: "2020-01-01T12:00:00.000Z"
            }
        });

        const res = await request(app)
            .delete("/api/users/me")
            .set(organizerAuth.headers);

        const deletedUser = await User.scope("withPassword").findByPk(organizerAuth.user.userId);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Account deleted successfully");

        expect(deletedUser.deletedAt).not.toBeNull();
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    it("should reject deleting current user account without token", async () => {
        const res = await request(app).delete("/api/users/me");

        expect(res.statusCode).toBe(401);
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    it("should reject account deletion when user owns active or upcoming events", async () => {
        const { organizerAuth } = await createEventWithOrganizer({
            organizer: {
                name: "Active Organizer",
                email: `activeorganizer${Date.now()}@test.com`
            }
        });

        const res = await request(app)
            .delete("/api/users/me")
            .set(organizerAuth.headers);

        const user = await User.findByPk(organizerAuth.user.userId);

        expect(res.statusCode).toBe(403);
        expect(user.deletedAt).toBeNull();
    });

    /* =============================
       ACCOUNT STATE
    ============================= */

    it("should reject login after account deletion", async () => {
        const userAuth = await registerAndGetToken({
            name: "Deleted Login User",
            email: `deletedlogin${Date.now()}@test.com`,
            password: "Password123"
        });

        await request(app)
            .delete("/api/users/me")
            .set(userAuth.headers);

        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: userAuth.email,
                password: userAuth.password
            });

        expect(res.statusCode).toBe(401);
    });
});
