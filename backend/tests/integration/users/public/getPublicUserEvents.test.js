/* ================================================
   USER INTEGRATION - PUBLIC USER EVENTS TESTS

   Tests:
   - authenticated public active events retrieval
   - authentication protection
   - invalid user ID validation
   - nonexistent user handling
   - created events retrieval
   - joined active events retrieval
   - inactive membership exclusion
   - duplicate event exclusion

   Ensures:
   - public user events are retrieved correctly
   - created and joined active events are separated correctly
   - inactive memberships are excluded from public joined events
   - created events are not duplicated in joined events
   - authentication and validators protect the route
================================================== */

const request = require("supertest");
const app = require("../../../../src/app");

const { User } = require("../../../../src/models");

const { initDB, resetDB, closeDB } = require("../../../helpers/database/dbTestHelper");

const { registerAndGetToken } = require("../../../helpers/api/authHelper");
const { createAuthenticatedEvent } = require("../../../helpers/api/eventHelper");
const { joinEvent } = require("../../../helpers/api/eventMembershipHelper");

describe("Get Public User Events API", () => {

    beforeAll(initDB);
    afterEach(resetDB);
    afterAll(closeDB);

    /* ============================
       PUBLIC USER EVENTS SUCCESS
    ============================= */

    it("should retrieve public user events", async () => {
        const viewerAuth = await registerAndGetToken({
            name: "Viewer",
            email: `viewer${Date.now()}@test.com`
        });

        const targetUserAuth = await registerAndGetToken({
            name: "Target User",
            email: `target${Date.now()}@test.com`
        });

        await createAuthenticatedEvent(targetUserAuth.headers, {
            title: "Created Event"
        });

        const res = await request(app)
            .get(`/api/users/${targetUserAuth.user.userId}/events`)
            .set(viewerAuth.headers);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Public user events retrieved successfully");
        expect(res.body).toHaveProperty("createdEvents");
        expect(res.body).toHaveProperty("joinedEvents");

        expect(Array.isArray(res.body.createdEvents)).toBe(true);
        expect(Array.isArray(res.body.joinedEvents)).toBe(true);
    });

    it("should retrieve created public user events", async () => {
        const viewerAuth = await registerAndGetToken({
            name: "Viewer",
            email: `createdviewer${Date.now()}@test.com`
        });

        const targetUserAuth = await registerAndGetToken({
            name: "Creator",
            email: `createdtarget${Date.now()}@test.com`
        });

        await createAuthenticatedEvent(targetUserAuth.headers, {
            title: "Created Public Event"
        });

        const res = await request(app)
            .get(`/api/users/${targetUserAuth.user.userId}/events`)
            .set(viewerAuth.headers);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Public user events retrieved successfully");

        expect(res.body.createdEvents.some(
            (event) => event.title === "Created Public Event"
        )).toBe(true);
    });

    it("should retrieve joined public user events", async () => {
        const viewerAuth = await registerAndGetToken({
            name: "Viewer",
            email: `joinedviewer${Date.now()}@test.com`
        });

        const targetUserAuth = await registerAndGetToken({
            name: "Participant",
            email: `joinedtarget${Date.now()}@test.com`
        });

        const eventCreatorAuth = await registerAndGetToken({
            name: "Event Creator",
            email: `eventcreator${Date.now()}@test.com`
        });

        const eventRes = await createAuthenticatedEvent(eventCreatorAuth.headers, {
            title: "Joined Public Event"
        });

        await joinEvent(eventRes.body.event.id, targetUserAuth.headers);

        const res = await request(app)
            .get(`/api/users/${targetUserAuth.user.userId}/events`)
            .set(viewerAuth.headers);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Public user events retrieved successfully");

        expect(res.body.joinedEvents.some(
            (event) => event.title === "Joined Public Event"
        )).toBe(true);
    });

    it("should exclude inactive memberships from joined public user events", async () => {
        const viewerAuth = await registerAndGetToken({
            name: "Viewer",
            email: `inactiveviewer${Date.now()}@test.com`
        });

        const targetUserAuth = await registerAndGetToken({
            name: "Inactive Participant",
            email: `inactiveparticipant${Date.now()}@test.com`
        });

        const eventCreatorAuth = await registerAndGetToken({
            name: "Event Creator",
            email: `inactivecreator${Date.now()}@test.com`
        });

        const eventRes = await createAuthenticatedEvent(eventCreatorAuth.headers, {
            title: "Inactive Joined Public Event"
        });

        await joinEvent(eventRes.body.event.id, targetUserAuth.headers);

        await request(app)
            .delete(`/api/events/${eventRes.body.event.id}/members/leave`)
            .set(targetUserAuth.headers);

        const res = await request(app)
            .get(`/api/users/${targetUserAuth.user.userId}/events`)
            .set(viewerAuth.headers);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Public user events retrieved successfully");

        expect(res.body.joinedEvents.some(
            (event) => event.title === "Inactive Joined Public Event"
        )).toBe(false);
    });

    it("should not duplicate created events in joined events", async () => {
        const viewerAuth = await registerAndGetToken({
            name: "Viewer",
            email: `duplicateviewer${Date.now()}@test.com`
        });

        const targetUserAuth = await registerAndGetToken({
            name: "Target User",
            email: `duplicatetarget${Date.now()}@test.com`
        });

        await createAuthenticatedEvent(targetUserAuth.headers, {
            title: "Non Duplicated Event"
        });

        const res = await request(app)
            .get(`/api/users/${targetUserAuth.user.userId}/events`)
            .set(viewerAuth.headers);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Public user events retrieved successfully");

        expect(res.body.createdEvents.some(
            (event) => event.title === "Non Duplicated Event"
        )).toBe(true);

        expect(res.body.joinedEvents.some(
            (event) => event.title === "Non Duplicated Event"
        )).toBe(false);
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    it("should reject unauthenticated request", async () => {
        const targetUser = await User.create({
            name: "Target User",
            email: `unauth${Date.now()}@test.com`,
            password: "Password123"
        });

        const res = await request(app).get(`/api/users/${targetUser.id}/events`);

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
            .get("/api/users/abc/events")
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
            .get("/api/users/999999/events")
            .set(viewerAuth.headers);

        expect(res.statusCode).toBe(404);
    });
});
