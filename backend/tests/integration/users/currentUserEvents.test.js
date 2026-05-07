/* ==================================================
   USER INTEGRATION - CURRENT USER EVENTS

   Tests:
   - authenticated user's events retrieval
   - authentication requirement
   - event status enrichment
   - participant count enrichment
   - pagination by view
   - history view filtering

   Ensures:
   - authenticated users can retrieve their related events
   - response includes event metadata
   - view filters and pagination work correctly
================================================== */

const request = require("supertest");
const app = require("../../../src/app");

const { initDB, sequelize, User, Event, EventUserRole } = require("../../../src/models");

const { registerAndGetToken } = require("../../helpers/authHelper");
const { createEvent } = require("../../helpers/eventHelper");

describe("Current User Events API", () => {
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
       CURRENT USER EVENTS
    ============================= */

    it("should get events for the authenticated user", async () => {
        const eventCreatorAuth = await registerAndGetToken({
            name: "Creator",
            email: `creator${Date.now()}@test.com`
        });

        const eventRes = await createEvent(eventCreatorAuth.headers, {
            title: "User Events Test"
        });

        const eventId = eventRes.body.event.id;

        const participantAuth = await registerAndGetToken({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        await request(app)
            .post(`/api/events/${eventId}/members/join`)
            .set(participantAuth.headers);

        const res = await request(app)
            .get("/api/users/me/events")
            .set(participantAuth.headers);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.events)).toBe(true);
        expect(res.body.events.length).toBeGreaterThan(0);
    });

    it("should reject getting current user events without token", async () => {
        const res = await request(app)
            .get("/api/users/me/events");

        expect(res.statusCode).toBe(401);
    });

    /* =============================
       EVENT METADATA
    ============================= */

    it("should include event status in current user events", async () => {
        const eventCreatorAuth = await registerAndGetToken({
            name: "Status Creator",
            email: `statuscreator${Date.now()}@test.com`
        });

        const eventRes = await createEvent(eventCreatorAuth.headers, {
            title: "Past Status Event",
            startDateTime: "2020-01-01T10:00:00.000Z",
            endDateTime: "2020-01-01T12:00:00.000Z"
        });

        const eventId = eventRes.body.event.id;

        const res = await request(app)
            .get("/api/users/me/events")
            .set(eventCreatorAuth.headers);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.events)).toBe(true);

        const eventMembership = res.body.events.find(
            (item) => item.event.id === eventId
        );

        expect(eventMembership).toBeDefined();

        expect(eventMembership.event).toHaveProperty(
            "status",
            "past"
        );
    });

    it("should include participant count and status in user events", async () => {
        const eventCreatorAuth = await registerAndGetToken({
            name: "Count Creator",
            email: `countcreator${Date.now()}@test.com`
        });

        const eventRes = await createEvent(eventCreatorAuth.headers, {
            title: "Count Event"
        });

        const eventId = eventRes.body.event.id;

        const participantAuth = await registerAndGetToken({
            name: "Count Participant",
            email: `countparticipant${Date.now()}@test.com`
        });

        await request(app)
            .post(`/api/events/${eventId}/members/join`)
            .set(participantAuth.headers);

        const res = await request(app)
            .get("/api/users/me/events")
            .set(eventCreatorAuth.headers);

        expect(res.statusCode).toBe(200);

        const eventMembership = res.body.events.find(
            (item) => item.event.id === eventId
        );

        expect(eventMembership).toBeDefined();
        expect(eventMembership.event).toHaveProperty("participantCount");
        expect(eventMembership.event.participantCount).toBeGreaterThanOrEqual(1);
        expect(eventMembership.event).toHaveProperty("status");
    });

    /* =============================
       PAGINATION / VIEWS
    ============================= */

    it("should paginate current user events by view", async () => {
        const eventCreatorAuth = await registerAndGetToken({
            name: "Paginated Creator",
            email: `paginatedcreator${Date.now()}@test.com`
        });

        await createEvent(eventCreatorAuth.headers, {
            title: "Created Event A"
        });

        await createEvent(eventCreatorAuth.headers, {
            title: "Created Event B"
        });

        await createEvent(eventCreatorAuth.headers, {
            title: "Created Event C"
        });

        const res = await request(app)
            .get("/api/users/me/events")
            .query({
                view: "created",
                page: 1,
                pageSize: 2
            })
            .set(eventCreatorAuth.headers);

        expect(res.statusCode).toBe(200);

        expect(Array.isArray(res.body.events)).toBe(true);
        expect(res.body.events.length).toBe(2);

        expect(res.body.totalEvents).toBe(3);
        expect(res.body.totalPages).toBe(2);
    });

    it("should filter current user events by history view", async () => {
        const eventCreatorAuth = await registerAndGetToken({
            name: "History Creator",
            email: `historycreator${Date.now()}@test.com`
        });

        await createEvent(eventCreatorAuth.headers, {
            title: "Active Created Event",
            startDateTime: "2026-12-31T10:00:00.000Z",
            endDateTime: "2026-12-31T12:00:00.000Z"
        });

        await createEvent(eventCreatorAuth.headers, {
            title: "Past Created Event",
            startDateTime: "2020-01-01T10:00:00.000Z",
            endDateTime: "2020-01-01T12:00:00.000Z"
        });

        const res = await request(app)
            .get("/api/users/me/events")
            .query({
                view: "createdHistory"
            })
            .set(eventCreatorAuth.headers);

        expect(res.statusCode).toBe(200);

        expect(Array.isArray(res.body.events)).toBe(true);
        expect(res.body.events.length).toBe(1);
        expect(res.body.events[0].event.title).toBe("Past Created Event");
        expect(res.body.events[0].event.status).toBe("past");
    });
});
