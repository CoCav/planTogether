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

const { registerAndGetToken } = require("../../helpers/authHelper");
const { createEvent } = require("../../helpers/eventHelper");

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
       GET EVENT BY ID
    ============================= */

    it("should retrieve a single event by ID", async () => {
        const auth = await registerAndGetToken({
            name: "Single Event User",
            email: `single${Date.now()}@test.com`
        });

        const eventRes = await createEvent(auth.headers);
        const event = eventRes.body.event;

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
        const auth = await registerAndGetToken({
            name: "Upcoming User",
            email: `upcoming${Date.now()}@test.com`
        });

        const eventRes = await createEvent(auth.headers, {
            title: "Upcoming Event",
            startDateTime: "2030-01-01T10:00:00.000Z",
            endDateTime: "2030-01-01T12:00:00.000Z"
        });

        const event = eventRes.body.event;

        const res = await request(app).get(`/api/events/${event.id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.event.status).toBe("upcoming");
    });

    it("should include past status for past event", async () => {
        const auth = await registerAndGetToken({
            name: "Past User",
            email: `past${Date.now()}@test.com`
        });

        const eventRes = await createEvent(auth.headers, {
            title: "Past Event",
            startDateTime: "2020-01-01T10:00:00.000Z",
            endDateTime: "2020-01-01T12:00:00.000Z"
        });

        const event = eventRes.body.event;

        const res = await request(app).get(`/api/events/${event.id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.event.status).toBe("past");
    });
});
