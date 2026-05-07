/* ==================================================
   EVENT MEMBERSHIP INTEGRATION - JOIN EVENT

   Tests:
   - joining an event
   - authentication requirement
   - duplicate join rejection
   - nonexistent event handling
   - past event restriction

   Ensures:
   - authenticated users can join events
   - invalid join requests are rejected correctly
================================================== */

const request = require("supertest");
const app = require("../../../src/app");
const { initDB, sequelize, User, Event, EventUserRole } = require("../../../src/models");

const { registerAndGetToken } = require("../../helpers/authHelper");
const { createEvent } = require("../../helpers/eventHelper");

describe("Join Event API", () => {
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


    it("should allow an authenticated user to join an event", async () => {
        const eventCreatorAuth = await registerAndGetToken({
            name: "Creator",
            email: `creator${Date.now()}@test.com`
        });

        const eventRes = await createEvent(eventCreatorAuth.headers);
        const event = eventRes.body.event;

        const userAuth = await registerAndGetToken({
            name: "User",
            email: `user${Date.now()}@test.com`
        });

        const res = await request(app)
            .post(`/api/events/${event.id}/members/join`)
            .set(userAuth.headers);

        expect(res.statusCode).toBe(200);
    });

    it("should reject joining without token", async () => {
        const auth = await registerAndGetToken({
            name: "User",
            email: `user${Date.now()}@test.com`
        });

        const eventRes = await createEvent(auth.headers);
        const event = eventRes.body.event;

        const res = await request(app)
            .post(`/api/events/${event.id}/members/join`);

        expect(res.statusCode).toBe(401);
    });

    it("should reject joining the same event twice", async () => {
        const eventCreatorAuth = await registerAndGetToken({
            name: "Creator",
            email: `creator${Date.now()}@test.com`
        });


        const eventRes = await createEvent(eventCreatorAuth.headers);
        const event = eventRes.body.event;

        const userAuth = await registerAndGetToken({
            name: "User",
            email: `user${Date.now()}@test.com`
        });

        await request(app)
            .post(`/api/events/${event.id}/members/join`)
            .set(userAuth.headers);

        const res = await request(app)
            .post(`/api/events/${event.id}/members/join`)
            .set(userAuth.headers);

        expect(res.statusCode).toBe(409);
    });

    it("should reject joining a nonexistent event", async () => {
        const auth = await registerAndGetToken({
            name: "User",
            email: `missingjoin${Date.now()}@test.com`
        });

        const res = await request(app)
            .post("/api/events/999999/members/join")
            .set(auth.headers);

        expect(res.statusCode).toBe(404);
    });

    it("should reject joining a past event", async () => {
        const eventCreatorAuth = await registerAndGetToken({
            name: "Creator",
            email: `creator${Date.now()}@test.com`
        });

        const eventRes = await createEvent(eventCreatorAuth.headers, {
            startDateTime: "2020-01-01T10:00:00.000Z",
            endDateTime: "2020-01-01T12:00:00.000Z"
        });

        const event = eventRes.body.event;

        const userAuth = await registerAndGetToken({
            name: "User",
            email: `user${Date.now()}@test.com`
        });

        const res = await request(app)
            .post(`/api/events/${event.id}/members/join`)
            .set(userAuth.headers);

        expect(res.statusCode).toBe(403);
    });
});
