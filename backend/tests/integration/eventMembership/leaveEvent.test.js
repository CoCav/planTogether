/* ==================================================
   EVENT MEMBERSHIP INTEGRATION - LEAVE EVENT

   Tests:
   - leaving an event
   - authentication requirement
   - leave without membership rejection
   - nonexistent event handling
   - past event restriction

   Ensures:
   - authenticated members can leave events
   - invalid leave requests are rejected correctly
================================================== */

const request = require("supertest");
const app = require("../../../src/app");

const { initDB, sequelize, User, Event, EventUserRole } = require("../../../src/models");

const { registerAndGetToken } = require("../../helpers/authHelper");
const { createEvent } = require("../../helpers/eventHelper");

describe("Leave Event API", () => {
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

    it("should allow a user to leave an event", async () => {
        const eventCreatorAuth = await registerAndGetToken({
            name: "Event Creator",
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
            .delete(`/api/events/${event.id}/members/leave`)
            .set(userAuth.headers);

        expect(res.statusCode).toBe(200);
    });

    it("should reject leaving without token", async () => {
        const eventCreatorAuth = await registerAndGetToken({
            name: "Event Creator",
            email: `creator${Date.now()}@test.com`
        });

        const eventRes = await createEvent(eventCreatorAuth.headers);
        const event = eventRes.body.event;

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/leave`);

        expect(res.statusCode).toBe(401);
    });

    it("should reject leaving an event without being a member", async () => {
        const eventCreatorAuth = await registerAndGetToken({
            name: "Event Creator",
            email: `creator${Date.now()}@test.com`
        });

        const eventRes = await createEvent(eventCreatorAuth.headers);
        const event = eventRes.body.event;

        const userAuth = await registerAndGetToken({
            name: "User",
            email: `nonmember${Date.now()}@test.com`
        });

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/leave`)
            .set(userAuth.headers);

        expect(res.statusCode).toBe(404);
    });

    it("should reject leaving a nonexistent event", async () => {
        const userAuth = await registerAndGetToken({
            name: "User",
            email: `missingleave${Date.now()}@test.com`
        });

        const res = await request(app)
            .delete("/api/events/999999/members/leave")
            .set(userAuth.headers);

        expect(res.statusCode).toBe(404);
    });

    it("should reject leaving a past event", async () => {
        const eventCreatorAuth = await registerAndGetToken({
            name: "Event Creator",
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

        await request(app)
            .post(`/api/events/${event.id}/members/join`)
            .set(userAuth.headers);

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/leave`)
            .set(userAuth.headers);

        expect(res.statusCode).toBe(403);
    });
});
