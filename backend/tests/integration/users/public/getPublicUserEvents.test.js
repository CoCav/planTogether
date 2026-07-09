/* ================================================
   USER INTEGRATION - PUBLIC USER EVENTS TESTS

   Tests:
   - public paginated events retrieval
   - created view retrieval
   - joined view retrieval
   - created event exclusion from joined view
   - participant count enrichment
   - status enrichment
   - pagination by view
   - inactive membership exclusion
   - invalid user ID validation
   - invalid query validation
   - nonexistent user handling
   - like count enrichment

   Ensures:
   - public user events are retrieved through view-based pagination
   - created and joined views work correctly
   - inactive memberships are excluded from joined events
   - pagination metadata is returned
   - validators protect route params and query params
================================================== */

const request = require("supertest");
const app = require("../../../../src/app");

const { EventLike } = require("../../../../src/models");

const { initializeTestDatabase, resetTestDatabase, closeTestDatabase } = require("../../../helpers/database/dbTestHelper");

const { registerAndAuthenticateUser } = require("../../../helpers/http/authTestHelper");
const { createEventAsAuthenticatedUser } = require("../../../helpers/http/eventTestHelper");
const { joinEventAsAuthenticatedUser } = require("../../../helpers/http/eventMembershipTestHelper");

describe("Get Public User Events API", () => {

    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* ============================
       PUBLIC USER EVENTS SUCCESS
    ============================= */

    it("should retrieve paginated public user events", async () => {
        const targetUserAuth = await registerAndAuthenticateUser({
            name: "Target User",
            email: `target${Date.now()}@test.com`
        });

        await createEventAsAuthenticatedUser(targetUserAuth.headers, {
            title: "Created Event"
        });

        const res = await request(app)
            .get(`/api/users/${targetUserAuth.user.userId}/events`)
            .query({
                view: "created"
            });

        expect(res.statusCode).toBe(200);

        expect(res.body).toHaveProperty("message", "Public user events retrieved successfully");

        expect(res.body).toHaveProperty("view", "created");
        expect(res.body).toHaveProperty("page", 1);
        expect(res.body).toHaveProperty("pageSize");
        expect(res.body).toHaveProperty("totalEvents");
        expect(res.body).toHaveProperty("totalPages");

        expect(Array.isArray(res.body.events)).toBe(true);
    });

    it("should retrieve created public user events", async () => {
        const targetUserAuth = await registerAndAuthenticateUser({
            name: "Creator",
            email: `createdtarget${Date.now()}@test.com`
        });

        await createEventAsAuthenticatedUser(targetUserAuth.headers, {
            title: "Created Public Event"
        });

        const res = await request(app)
            .get(`/api/users/${targetUserAuth.user.userId}/events`)
            .query({
                view: "created"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Public user events retrieved successfully");

        expect(res.body.events.some(
            (event) => event.title === "Created Public Event"
        )).toBe(true);
    });

    it("should retrieve joined public user events", async () => {
        const targetUserAuth = await registerAndAuthenticateUser({
            name: "Participant",
            email: `joinedtarget${Date.now()}@test.com`
        });

        const eventCreatorAuth = await registerAndAuthenticateUser({
            name: "Event Creator",
            email: `eventcreator${Date.now()}@test.com`
        });

        const eventRes = await createEventAsAuthenticatedUser(eventCreatorAuth.headers, {
            title: "Joined Public Event"
        });

        await joinEventAsAuthenticatedUser(eventRes.body.event.id, targetUserAuth.headers);

        const res = await request(app)
            .get(`/api/users/${targetUserAuth.user.userId}/events`)
            .query({
                view: "joined"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Public user events retrieved successfully");

        expect(res.body.events.some(
            (event) => event.title === "Joined Public Event"
        )).toBe(true);
    });

    it("should exclude inactive memberships from joined public user events", async () => {
        const targetUserAuth = await registerAndAuthenticateUser({
            name: "Inactive Participant",
            email: `inactiveparticipant${Date.now()}@test.com`
        });

        const eventCreatorAuth = await registerAndAuthenticateUser({
            name: "Event Creator",
            email: `inactivecreator${Date.now()}@test.com`
        });

        const eventRes = await createEventAsAuthenticatedUser(eventCreatorAuth.headers, {
            title: "Inactive Joined Public Event"
        });

        await joinEventAsAuthenticatedUser(eventRes.body.event.id, targetUserAuth.headers);

        await request(app)
            .delete(`/api/events/${eventRes.body.event.id}/members/leave`)
            .set(targetUserAuth.headers);

        const res = await request(app)
            .get(`/api/users/${targetUserAuth.user.userId}/events`)
            .query({
                view: "joined"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Public user events retrieved successfully");

        expect(res.body.events.some(
            (event) => event.title === "Inactive Joined Public Event"
        )).toBe(false);
    });

    it("should not return created events in joined view", async () => {
        const targetUserAuth = await registerAndAuthenticateUser({
            name: "Target User",
            email: `creatednotjoined${Date.now()}@test.com`
        });

        await createEventAsAuthenticatedUser(targetUserAuth.headers, {
            title: "Created Only Event"
        });

        const res = await request(app)
            .get(`/api/users/${targetUserAuth.user.userId}/events`)
            .query({
                view: "joined"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("view", "joined");

        expect(res.body.events.some(
            (event) => event.title === "Created Only Event"
        )).toBe(false);
    });

    /* ============================
       EVENT METADATA
    ============================= */

    it("should include like count and false current user like state for anonymous public user events", async () => {
        const targetUserAuth = await registerAndAuthenticateUser({
            name: "Public Like Target",
            email: `publicliketarget${Date.now()}@test.com`
        });

        const likerAuth = await registerAndAuthenticateUser({
            name: "Public Liker",
            email: `publicliker${Date.now()}@test.com`
        });

        const eventRes = await createEventAsAuthenticatedUser(targetUserAuth.headers, {
            title: "Public Like Stats Event"
        });

        await EventLike.create({
            eventId: eventRes.body.event.id,
            userId: likerAuth.user.userId
        });

        const res = await request(app)
            .get(`/api/users/${targetUserAuth.user.userId}/events`)
            .query({ view: "created" });

        expect(res.statusCode).toBe(200);

        const event = res.body.events.find((item) => item.id === eventRes.body.event.id);

        expect(event).toBeDefined();
        expect(Number(event.likesCount)).toBe(1);
        expect(event.isLikedByCurrentUser).toBe(false);
    });

    it("should include current user like state for authenticated public user events", async () => {
        const targetUserAuth = await registerAndAuthenticateUser({
            name: "Liked Public Target",
            email: `likedpublictarget${Date.now()}@test.com`
        });

        const viewerAuth = await registerAndAuthenticateUser({
            name: "Public Viewer",
            email: `publicviewer${Date.now()}@test.com`
        });

        const eventRes = await createEventAsAuthenticatedUser(targetUserAuth.headers, {
            title: "Liked Public Event"
        });

        await EventLike.create({
            eventId: eventRes.body.event.id,
            userId: viewerAuth.user.userId
        });

        const res = await request(app)
            .get(`/api/users/${targetUserAuth.user.userId}/events`)
            .query({ view: "created" })
            .set(viewerAuth.headers);

        expect(res.statusCode).toBe(200);

        const event = res.body.events.find((item) => item.id === eventRes.body.event.id);

        expect(event).toBeDefined();
        expect(Number(event.likesCount)).toBe(1);
        expect(event.isLikedByCurrentUser).toBe(true);
    });

    /* ============================
       PAGINATION
    ============================= */

    it("should paginate public user events by view", async () => {
        const userAuth = await registerAndAuthenticateUser({
            name: "Pagination User",
            email: `pagination${Date.now()}@test.com`
        });

        await createEventAsAuthenticatedUser(userAuth.headers, {
            title: "Event A"
        });

        await createEventAsAuthenticatedUser(userAuth.headers, {
            title: "Event B"
        });

        await createEventAsAuthenticatedUser(userAuth.headers, {
            title: "Event C"
        });

        const res = await request(app)
            .get(`/api/users/${userAuth.user.userId}/events`)
            .query({
                view: "created",
                page: 1,
                pageSize: 2
            });

        expect(res.statusCode).toBe(200);

        expect(res.body.events.length).toBe(2);
        expect(res.body.totalEvents).toBe(3);
        expect(res.body.totalPages).toBe(2);
    });

    it("should sort public user events by title", async () => {
        const userAuth = await registerAndAuthenticateUser({
            name: "Sorting User",
            email: `sorting${Date.now()}@test.com`
        });

        await createEventAsAuthenticatedUser(userAuth.headers, {
            title: "Zulu Event"
        });

        await createEventAsAuthenticatedUser(userAuth.headers, {
            title: "Alpha Event"
        });

        const res = await request(app)
            .get(`/api/users/${userAuth.user.userId}/events`)
            .query({
                view: "created",
                sortBy: "title",
                order: "asc"
            });

        expect(res.statusCode).toBe(200);

        expect(res.body.events[0].title).toBe("Alpha Event");
        expect(res.body.events[1].title).toBe("Zulu Event");
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    it("should reject invalid user ID", async () => {
        const res = await request(app).get("/api/users/abc/events");

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid view", async () => {
        const res = await request(app)
            .get("/api/users/1/events")
            .query({
                view: "invalid"
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid page", async () => {
        const res = await request(app)
            .get("/api/users/1/events")
            .query({
                page: 0
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid pageSize", async () => {
        const res = await request(app)
            .get("/api/users/1/events")
            .query({
                pageSize: 500
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid sortBy", async () => {
        const res = await request(app)
            .get("/api/users/1/events")
            .query({
                sortBy: "invalid"
            });

        expect(res.statusCode).toBe(400);
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    it("should return 404 if user does not exist", async () => {
        const res = await request(app).get("/api/users/999999/events");

        expect(res.statusCode).toBe(404);
    });
});
