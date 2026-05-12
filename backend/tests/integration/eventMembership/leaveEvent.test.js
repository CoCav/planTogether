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

const { initDB, resetDB, closeDB } = require("../../helpers/database/dbTestHelper");

const { registerAndGetToken } = require("../../helpers/api/authHelper");
const { createEventWithOrganizer } = require("../../helpers/api/eventHelper");
const { joinEvent } = require("../../helpers/api/eventMembershipHelper");

describe("Leave Event API", () => {

    beforeAll(initDB);
    afterEach(resetDB);
    afterAll(closeDB);

    /* =============================
       LEAVE EVENT SUCCESS
    ============================= */

    it("should allow a user to leave an event", async () => {
        const { event } = await createEventWithOrganizer();

        const participantAuth = await registerAndGetToken({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        await joinEvent(event.id, participantAuth.headers);

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/leave`)
            .set(participantAuth.headers);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "User successfully left the event");
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    it("should reject leaving without token", async () => {
        const { event } = await createEventWithOrganizer();

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
        const { event } = await createEventWithOrganizer();

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
        const { organizerAuth, event } = await createEventWithOrganizer();

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/leave`)
            .set(organizerAuth.headers);

        expect(res.statusCode).toBe(403);
    });

    it("should reject leaving a past event", async () => {
        const { event } = await createEventWithOrganizer({
            event: {
                startDateTime: "2020-01-01T10:00:00.000Z",
                endDateTime: "2020-01-01T12:00:00.000Z"
            }
        });

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
