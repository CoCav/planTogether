/* ==================================================
   EVENT MEMBERSHIP INTEGRATION - GET EVENT MEMBERS

   Tests:
   - event members retrieval
   - public access to event members endpoint

   Ensures:
   - event members are returned correctly
   - public users can access event members endpoint
================================================== */

const request = require("supertest");
const app = require("../../../src/app");

const { initDB, sequelize, User, Event, EventUserRole } = require("../../../src/models");

const { registerAndGetToken } = require("../../helpers/authHelper");
const { createEvent } = require("../../helpers/eventHelper");

describe("Get Event Members API", () => {
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
       EVENT MEMBERS RETRIEVAL
    ============================= */

    it("should retrieve event members", async () => {
        const eventCreatorAuth = await registerAndGetToken({
            name: "Event Creator",
            email: `creator${Date.now()}@test.com`
        });

        const eventRes = await createEvent(eventCreatorAuth.headers);
        const eventId = eventRes.body.event.id;

        const participantAuth = await registerAndGetToken({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        await request(app)
            .post(`/api/events/${eventId}/members/join`)
            .set(participantAuth.headers);

        const res = await request(app)
            .get(`/api/events/${eventId}/members`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("members");
        expect(Array.isArray(res.body.members)).toBe(true);
        expect(res.body.members.length).toBeGreaterThan(0);
    });

    it("should allow public access to event members endpoint", async () => {
        const eventCreatorAuth = await registerAndGetToken({
            name: "Event Creator",
            email: `creator${Date.now()}@test.com`
        });

        const eventRes = await createEvent(eventCreatorAuth.headers);
        const eventId = eventRes.body.event.id;

        const res = await request(app)
            .get(`/api/events/${eventId}/members`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("members");
    });
});
