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
       HELPERS
    ============================= */

    // Register a test user and return auth token
    const registerAndGetToken = async (name, email) => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name,
                email,
                password: "Password123"
            });

        return res.body.token;
    };

    /* =============================
       PUBLIC USER EVENTS
    ============================= */

    it("should get created and joined events", async () => {
        const token = await registerAndGetToken(
            "Viewer",
            `viewer${Date.now()}@test.com`
        );

        const target = await User.create({
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
            creatorId: target.id,
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
            userId: target.id,
            role: "organizer"
        });

        // Joined membership
        await EventUserRole.create({
            eventId: joinedEvent.id,
            userId: target.id,
            role: "participant"
        });

        const res = await request(app)
            .get(`/api/users/${target.id}/events`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);

        expect(res.body.createdEvents.length).toBe(1);
        expect(res.body.joinedEvents.length).toBe(1);

        expect(res.body.createdEvents[0].id).toBe(createdEvent.id);
        expect(res.body.joinedEvents[0].id).toBe(joinedEvent.id);
    });

    it("should return empty arrays if no events", async () => {
        const token = await registerAndGetToken(
            "Viewer",
            `viewer${Date.now()}@test.com`
        );

        const user = await User.create({
            name: "Empty User",
            email: `empty${Date.now()}@test.com`,
            password: "Password123"
        });

        const res = await request(app)
            .get(`/api/users/${user.id}/events`)
            .set("Authorization", `Bearer ${token}`);

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
        const token = await registerAndGetToken(
            "Viewer",
            `viewer${Date.now()}@test.com`
        );

        const res = await request(app)
            .get("/api/users/abc/events")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(400);
    });

    it("should return 404 if user does not exist", async () => {
        const token = await registerAndGetToken(
            "Viewer",
            `viewer${Date.now()}@test.com`
        );

        const res = await request(app)
            .get("/api/users/999999/events")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(404);
    });
});
