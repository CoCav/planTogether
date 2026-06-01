/* =================================================
   USER INTEGRATION - PUBLIC USER PROFILE TESTS

   Tests:
   - public profile retrieval
   - invalid user ID validation
   - nonexistent user handling
   - sensitive data protection
   - public active stats retrieval

   Ensures:
   - public user profiles are correctly retrieved
   - private user fields are never exposed
   - public stats only count active memberships
   - public stats are included in the response
   - validators protect the route
=================================================== */

const request = require("supertest");
const app = require("../../../../src/app");

const { User } = require("../../../../src/models");

const { initDB, resetDB, closeDB } = require("../../../helpers/database/dbTestHelper");

const { registerAndGetToken } = require("../../../helpers/api/authHelper");
const { createAuthenticatedEvent } = require("../../../helpers/api/eventHelper");
const { joinEvent } = require("../../../helpers/api/eventMembershipHelper");

describe("Get Public User Profile API", () => {

    beforeAll(initDB);
    afterEach(resetDB);
    afterAll(closeDB);

    /* =================================
       PUBLIC PROFILE RETRIEVAL SUCCESS
    =================================== */

    it("should get public user profile", async () => {
        const targetUser = await User.create({
            name: "Target User",
            email: `target${Date.now()}@test.com`,
            password: "Password123",
            avatar: "/uploads/avatars/test.png"
        });

        const res = await request(app).get(`/api/users/${targetUser.id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Public user profile retrieved successfully");
        expect(res.body).toHaveProperty("user");
        expect(res.body).toHaveProperty("stats");

        expect(res.body.user).toMatchObject({
            name: "Target User",
            avatar: "/uploads/avatars/test.png"
        });
    });

    it("should include public user stats", async () => {
        const targetUserAuth = await registerAndGetToken({
            name: "Target User",
            email: `targetstats${Date.now()}@test.com`
        });

        await createAuthenticatedEvent(targetUserAuth.headers, { title: "Created Event" });

        const joinedEventCreatorAuth = await registerAndGetToken({
            name: "Joined Event Creator",
            email: `joinedcreator${Date.now()}@test.com`
        });

        const joinedEventRes = await createAuthenticatedEvent(joinedEventCreatorAuth.headers, {
            title: "Joined Event"
        });

        await joinEvent(joinedEventRes.body.event.id, targetUserAuth.headers);

        const res = await request(app).get(`/api/users/${targetUserAuth.user.userId}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Public user profile retrieved successfully");

        expect(res.body.stats).toHaveProperty("createdEventsCount", 1);
        expect(res.body.stats).toHaveProperty("joinedEventsCount", 1);
    });

    it("should exclude inactive memberships from public user stats", async () => {
        const targetUserAuth = await registerAndGetToken({
            name: "Inactive Stats User",
            email: `inactivestats${Date.now()}@test.com`
        });

        const eventCreatorAuth = await registerAndGetToken({
            name: "Event Creator",
            email: `inactiveprofilecreator${Date.now()}@test.com`
        });

        const eventRes = await createAuthenticatedEvent(eventCreatorAuth.headers, {
            title: "Inactive Stats Event"
        });

        await joinEvent(eventRes.body.event.id, targetUserAuth.headers);

        await request(app)
            .delete(`/api/events/${eventRes.body.event.id}/members/leave`)
            .set(targetUserAuth.headers);

        const res = await request(app).get(`/api/users/${targetUserAuth.user.userId}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Public user profile retrieved successfully");

        expect(res.body.stats).toHaveProperty("joinedEventsCount", 0);
    });

    /* =============================
       SENSITIVE DATA PROTECTION
    ============================= */

    it("should never expose sensitive user fields publicly", async () => {
        const targetUser = await User.create({
            name: "Sensitive User",
            email: `sensitive${Date.now()}@test.com`,
            password: "Password123",
            avatar: "/uploads/avatars/test.png"
        });

        const res = await request(app).get(`/api/users/${targetUser.id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Public user profile retrieved successfully");

        expect(res.body.user).not.toHaveProperty("id");
        expect(res.body.user).not.toHaveProperty("email");
        expect(res.body.user).not.toHaveProperty("password");
        expect(res.body.user).not.toHaveProperty("createdAt");
        expect(res.body.user).not.toHaveProperty("updatedAt");
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    it("should reject invalid user ID", async () => {
        const res = await request(app).get("/api/users/abc");

        expect(res.statusCode).toBe(400);
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    it("should return 404 if user does not exist", async () => {
        const res = await request(app).get("/api/users/999999");

        expect(res.statusCode).toBe(404);
    });
});
