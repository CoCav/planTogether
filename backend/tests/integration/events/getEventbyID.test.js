/* ==================================================
   EVENTS INTEGRATION - GET EVENT BY ID

   Tests:
   - single event retrieval
   - nonexistent event handling
   - event status computation

   Ensures:
   - a single event can be retrieved by ID
   - nonexistent events return 404
   - event status is computed in the response
================================================== */

const request = require("supertest");
const app = require("../../../src/app");
const { initDB, sequelize, User, Event, EventUserRole } = require("../../../src/models");

describe("Get Event By ID API", () => {
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

    const getValidEventPayload = (overrides = {}) => ({
        title: "Test Event",
        description: "This is a test event",
        startDateTime: "2026-12-31T10:00:00.000Z",
        endDateTime: "2026-12-31T12:00:00.000Z",
        mode: "in_person",
        location: "Montreal",
        type: "Meetup",
        theme: "Technology",
        ...overrides
    });

    const createEvent = async (token, overrides = {}) => {
        const res = await request(app)
            .post("/api/events")
            .set("Authorization", `Bearer ${token}`)
            .send(getValidEventPayload(overrides));

        return res.body.event;
    };

    /* =============================
       GET EVENT BY ID
    ============================= */

    it("should retrieve a single event by ID", async () => {
        const token = await registerAndGetToken(
            "Single Event User",
            `single${Date.now()}@test.com`
        );

        const event = await createEvent(token);

        const res = await request(app).get(`/api/events/${event.id}`);

        expect(res.statusCode).toBe(200);

        expect(res.body).toHaveProperty("message", "Event retrieved successfully");
        expect(res.body).toHaveProperty("event");

        expect(res.body.event).toMatchObject({
            id: event.id,
            title: "Test Event"
        });
    });

    it("should return 404 for nonexistent event", async () => {
        const res = await request(app).get("/api/events/999999");

        expect(res.statusCode).toBe(404);
    });

    /* =============================
       EVENT STATUS
    ============================= */

    it("should include upcoming status for future event", async () => {
        const token = await registerAndGetToken(
            "Upcoming User",
            `upcoming${Date.now()}@test.com`
        );

        const event = await createEvent(token, {
            title: "Upcoming Event",
            startDateTime: "2030-01-01T10:00:00.000Z",
            endDateTime: "2030-01-01T12:00:00.000Z"
        });

        const res = await request(app).get(`/api/events/${event.id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.event.status).toBe("upcoming");
    });

    it("should include past status for past event", async () => {
        const token = await registerAndGetToken(
            "Past User",
            `past${Date.now()}@test.com`
        );

        const event = await createEvent(token, {
            title: "Past Event",
            startDateTime: "2020-01-01T10:00:00.000Z",
            endDateTime: "2020-01-01T12:00:00.000Z"
        });

        const res = await request(app).get(`/api/events/${event.id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.event.status).toBe("past");
    });
});
