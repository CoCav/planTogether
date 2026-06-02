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

   Ensures:
   - public user events are retrieved through view-based pagination
   - created and joined views work correctly
   - inactive memberships are excluded from joined events
   - pagination metadata is returned
   - validators protect route params and query params
================================================== */

const request = require("supertest");
const app = require("../../../../src/app");

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

    it("should retrieve paginated public user events", async () => {
        const targetUserAuth = await registerAndGetToken({
            name: "Target User",
            email: `target${Date.now()}@test.com`
        });

        await createAuthenticatedEvent(targetUserAuth.headers, {
            title: "Created Event"
        });

        const res = await request(app)
            .get(`/api/users/${targetUserAuth.user.userId}/events`)
            .query({
                view: "created"
            });

        expect(res.statusCode).toBe(200);

        expect(res.body).toHaveProperty(
            "message",
            "Public user events retrieved successfully"
        );

        expect(res.body).toHaveProperty("view", "created");
        expect(res.body).toHaveProperty("page", 1);
        expect(res.body).toHaveProperty("pageSize");
        expect(res.body).toHaveProperty("totalEvents");
        expect(res.body).toHaveProperty("totalPages");

        expect(Array.isArray(res.body.events)).toBe(true);
    });

    it("should retrieve created public user events", async () => {
        const targetUserAuth = await registerAndGetToken({
            name: "Creator",
            email: `createdtarget${Date.now()}@test.com`
        });

        await createAuthenticatedEvent(targetUserAuth.headers, {
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
        const targetUserAuth = await registerAndGetToken({
            name: "Target User",
            email: `creatednotjoined${Date.now()}@test.com`
        });

        await createAuthenticatedEvent(targetUserAuth.headers, {
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
       PAGINATION
    ============================= */

    it("should paginate public user events by view", async () => {
        const userAuth = await registerAndGetToken({
            name: "Pagination User",
            email: `pagination${Date.now()}@test.com`
        });

        await createAuthenticatedEvent(userAuth.headers, {
            title: "Event A"
        });

        await createAuthenticatedEvent(userAuth.headers, {
            title: "Event B"
        });

        await createAuthenticatedEvent(userAuth.headers, {
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
        const userAuth = await registerAndGetToken({
            name: "Sorting User",
            email: `sorting${Date.now()}@test.com`
        });

        await createAuthenticatedEvent(userAuth.headers, {
            title: "Zulu Event"
        });

        await createAuthenticatedEvent(userAuth.headers, {
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
