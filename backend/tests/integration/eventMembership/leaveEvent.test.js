/* ==================================================
   EVENT MEMBERSHIP INTEGRATION - LEAVE EVENT TESTS

   Tests:
   - leaving an event
   - authentication requirement
   - leave without membership rejection
   - organizer leave restriction
   - nonexistent event handling
   - past event restriction
   - invalid event ID validation

   Ensures:
   - authenticated members can leave events
   - organizers cannot leave their own events
   - invalid leave requests are rejected correctly
================================================== */

const request = require("supertest");
const app = require("../../../src/app");

const { initDB, sequelize, User, Event, EventUserRole } = require("../../../src/models");

const { registerAndGetToken } = require("../../helpers/authHelper");
const { createEvent } = require("../../helpers/eventHelper");
const { joinEvent } = require("../../helpers/eventMembershipHelper");

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

    /* =============================
       LEAVE SUCCESS
    ============================= */

    it("should allow a user to leave an event", async () => {
        const eventCreatorAuth = await registerAndGetToken({
            name: "Event Creator",
            email: `creator${Date.now()}@test.com`
        });

        const eventRes = await createEvent(eventCreatorAuth.headers);
        const event = eventRes.body.event;

        const participantAuth = await registerAndGetToken({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        await joinEvent(event.id, participantAuth.headers);

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/leave`)
            .set(participantAuth.headers);

        expect(res.statusCode).toBe(200);
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    it("should reject leaving without token", async () => {
        const eventCreatorAuth = await registerAndGetToken({
            name: "Event Creator",
            email: `creator${Date.now()}@test.com`
        });

        const eventRes = await createEvent(eventCreatorAuth.headers);
        const event = eventRes.body.event;

        const res = await request(app).delete(`/api/events/${event.id}/members/leave`);

        expect(res.statusCode).toBe(401);
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    it("should reject invalid eventId", async () => {
        const participantAuth = await registerAndGetToken({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        const res = await request(app)
            .delete("/api/events/abc/members/leave")
            .set(participantAuth.headers);

        expect(res.statusCode).toBe(400);
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    it("should reject leaving an event without being a member", async () => {
        const eventCreatorAuth = await registerAndGetToken({
            name: "Event Creator",
            email: `creator${Date.now()}@test.com`
        });

        const eventRes = await createEvent(eventCreatorAuth.headers);
        const event = eventRes.body.event;

        const participantAuth = await registerAndGetToken({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/leave`)
            .set(participantAuth.headers);

        expect(res.statusCode).toBe(404);
    });

    it("should reject organizer leaving own event", async () => {
        const eventCreatorAuth = await registerAndGetToken({
            name: "Event Creator",
            email: `creator${Date.now()}@test.com`
        });

        const eventRes = await createEvent(eventCreatorAuth.headers);
        const event = eventRes.body.event;

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/leave`)
            .set(eventCreatorAuth.headers);

        expect(res.statusCode).toBe(403);
    });

    it("should reject leaving a past event", async () => {
        const eventCreatorAuth = await registerAndGetToken({
            name: "Event Creator",
            email: `creator${Date.now()}@test.com`
        });

        const eventRes = await createEvent(
            eventCreatorAuth.headers,
            {
                startDateTime: "2020-01-01T10:00:00.000Z",
                endDateTime: "2020-01-01T12:00:00.000Z"
            }
        );

        const event = eventRes.body.event;

        const participantAuth = await registerAndGetToken({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        await joinEvent(event.id, participantAuth.headers);

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/leave`)
            .set(participantAuth.headers);

        expect(res.statusCode).toBe(403);
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should reject leaving a nonexistent event", async () => {
        const participantAuth = await registerAndGetToken({
            name: "Participant",
            email: `missingleave${Date.now()}@test.com`
        });

        const res = await request(app)
            .delete("/api/events/999999/members/leave")
            .set(participantAuth.headers);

        expect(res.statusCode).toBe(404);
    });
});
