/* =================================================
   USER INTEGRATION - PUBLIC USER PROFILE TESTS

   Tests:
   - authenticated public profile retrieval
   - authentication protection
   - invalid user ID validation
   - nonexistent user handling
   - sensitive data protection
   - public stats retrieval

   Ensures:
   - public user profiles are correctly retrieved
   - private user fields are never exposed
   - public stats are included in the response
   - authentication and validators protect the route
=================================================== */

const request = require("supertest");
const app = require("../../../../src/app");

const { User } = require("../../../../src/models");

const { initDB, resetDB, closeDB } = require("../../../helpers/database/dbTestHelper");

const { registerAndGetToken } = require("../../../helpers/api/authHelper");
const { createEvent } = require("../../../helpers/api/eventHelper");
const { joinEvent } = require("../../../helpers/api/eventMembershipHelper");

describe("Get Public User Profile API", () => {

    beforeAll(initDB);
    afterEach(resetDB);
    afterAll(closeDB);

    /* =================================
       PUBLIC PROFILE RETRIEVAL SUCCESS
    =================================== */

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
    });

    it("should include public user stats", async () => {
        const viewerAuth = await registerAndGetToken({
            name: "Viewer",
            email: `viewerstats${Date.now()}@test.com`
        });

        const targetUserAuth = await registerAndGetToken({
            name: "Target User",
            email: `targetstats${Date.now()}@test.com`
        });

        await createEvent(targetUserAuth.headers, { title: "Created Event" });

        const joinedEventCreatorAuth = await registerAndGetToken({
            name: "Joined Event Creator",
            email: `joinedcreator${Date.now()}@test.com`
        });

        const joinedEventRes = await createEvent(
            joinedEventCreatorAuth.headers,
            {
                title: "Joined Event"
            }
        );

        await joinEvent(joinedEventRes.body.event.id, targetUserAuth.headers);

        const res = await request(app)
            .get(`/api/users/${targetUserAuth.user.userId}`)
            .set(viewerAuth.headers);

        expect(res.statusCode).toBe(200);

        expect(res.body.stats).toHaveProperty("createdEventsCount", 1);
        expect(res.body.stats).toHaveProperty("joinedEventsCount", 2);
    });

    /* =============================
       SENSITIVE DATA PROTECTION
    ============================= */

    it("should never expose sensitive user fields publicly", async () => {
        const viewerAuth = await registerAndGetToken({
            name: "Viewer",
            email: `sensitiveviewer${Date.now()}@test.com`
        });

        const targetUser = await User.create({
            name: "Sensitive User",
            email: `sensitive${Date.now()}@test.com`,
            password: "Password123",
            avatar: "/uploads/avatars/test.png"
        });

        const res = await request(app)
            .get(`/api/users/${targetUser.id}`)
            .set(viewerAuth.headers);

        expect(res.statusCode).toBe(200);

        expect(res.body.user).not.toHaveProperty("id");
        expect(res.body.user).not.toHaveProperty("email");
        expect(res.body.user).not.toHaveProperty("password");
        expect(res.body.user).not.toHaveProperty("createdAt");
        expect(res.body.user).not.toHaveProperty("updatedAt");
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    it("should reject unauthenticated request", async () => {
        const targetUser = await User.create({
            name: "Test User",
            email: `test${Date.now()}@test.com`,
            password: "Password123"
        });

        const res = await request(app)
            .get(`/api/users/${targetUser.id}`);

        expect(res.statusCode).toBe(401);
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    it("should reject invalid user ID", async () => {
        const viewerAuth = await registerAndGetToken({
            name: "Viewer",
            email: `invalidviewer${Date.now()}@test.com`
        });

        const res = await request(app)
            .get("/api/users/abc")
            .set(viewerAuth.headers);

        expect(res.statusCode).toBe(400);
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    it("should return 404 if user does not exist", async () => {
        const viewerAuth = await registerAndGetToken({
            name: "Viewer",
            email: `missingviewer${Date.now()}@test.com`
        });

        const res = await request(app)
            .get("/api/users/999999")
            .set(viewerAuth.headers);

        expect(res.statusCode).toBe(404);
    });
});
