/* ==================================================
   USER INTEGRATION - PUBLIC USER EVENTS

   Tests:
   - retrieve created events
   - retrieve joined events
   - separation between created and joined events
   - no duplication of created events in joined list
   - authentication and validation

   Ensures:
   - public user events are correctly categorized
   - created and joined events remain separated
   - authentication and validators protect the route
================================================== */

const request = require("supertest");
const app = require("../../../src/app");

const { initDB, sequelize, User, Event, EventUserRole } = require("../../../src/models");

const { registerAndGetToken } = require("../../helpers/authHelper");

describe("Public User Events API", () => {
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
       PUBLIC USER EVENTS
    ============================= */

    it("should get created and joined events", async () => {
        const viewerAuth = await registerAndGetToken({
            name: "Viewer",
            email: `viewer${Date.now()}@test.com`
        });

        const targetUser = await User.create({
            name: "Target User",
            email: `target${Date.now()}@test.com`,
            password: "Password123"
        });

        const otherUser = await User.create({
            name: "Other User",
            email: `other${Date.now()}@test.com`,
            password: "Password123"
        });

        const createdEvent = await Event.create({
            creatorId: targetUser.id,
            title: "Created Event",
            description: "desc",
            type: "Meetup",
            theme: "Tech",
            mode: "in_person",
            location: "Paris",
            startDateTime: "2030-01-01T10:00:00Z",
            endDateTime: "2030-01-01T12:00:00Z"
        });

        const joinedEvent = await Event.create({
            creatorId: otherUser.id,
            title: "Joined Event",
            description: "desc",
            type: "Meetup",
            theme: "Tech",
            mode: "in_person",
            location: "Lyon",
            startDateTime: "2030-02-01T10:00:00Z",
            endDateTime: "2030-02-01T12:00:00Z"
        });

        // Creator membership
        await EventUserRole.create({
            eventId: createdEvent.id,
            userId: targetUser.id,
            role: "organizer"
        });

        // Joined membership
        await EventUserRole.create({
            eventId: joinedEvent.id,
            userId: targetUser.id,
            role: "participant"
        });

        const res = await request(app)
            .get(`/api/users/${targetUser.id}/events`)
            .set(viewerAuth.headers);

        expect(res.statusCode).toBe(200);

        expect(res.body.createdEvents.length).toBe(1);
        expect(res.body.joinedEvents.length).toBe(1);

        expect(res.body.createdEvents[0].id).toBe(createdEvent.id);
        expect(res.body.joinedEvents[0].id).toBe(joinedEvent.id);
    });

    it("should return empty arrays if no events", async () => {
        const viewerAuth = await registerAndGetToken({
            name: "Viewer",
            email: `viewer${Date.now()}@test.com`
        });

        const targetUser = await User.create({
            name: "Empty User",
            email: `empty${Date.now()}@test.com`,
            password: "Password123"
        });

        const res = await request(app)
            .get(`/api/users/${targetUser.id}/events`)
            .set(viewerAuth.headers);

        expect(res.statusCode).toBe(200);

        expect(res.body).toEqual({
            createdEvents: [],
            joinedEvents: []
        });
    });

    /* =============================
       AUTHENTICATION & VALIDATION
    ============================= */

    it("should reject unauthenticated request", async () => {
        const res = await request(app)
            .get("/api/users/1/events");

        expect(res.statusCode).toBe(401);
    });

    it("should reject invalid user ID", async () => {
        const viewerAuth = await registerAndGetToken({
            name: "Viewer",
            email: `viewer${Date.now()}@test.com`
        });

        const res = await request(app)
            .get("/api/users/abc/events")
            .set(viewerAuth.headers);

        expect(res.statusCode).toBe(400);
    });

    it("should return 404 if user does not exist", async () => {
        const viewerAuth = await registerAndGetToken({
            name: "Viewer",
            email: `viewer${Date.now()}@test.com`
        });

        const res = await request(app)
            .get("/api/users/999999/events")
            .set(viewerAuth.headers);

        expect(res.statusCode).toBe(404);
    });
});
