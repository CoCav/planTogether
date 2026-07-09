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
   - leaving an event keeps membership history
   - memberships are soft-deleted instead of permanently removed
   - organizers cannot leave their own events
   - invalid leave requests are rejected correctly
================================================== */

const request = require("supertest");
const app = require("../../../src/app");

const { EventUserRole } = require("../../../src/models");

const { initializeTestDatabase, resetTestDatabase, closeTestDatabase } = require("../../helpers/database/dbTestHelper");

const { registerAndAuthenticateUser } = require("../../helpers/http/authTestHelper");
const { createOrganizerAndEvent } = require("../../helpers/http/eventTestHelper");
const { joinEventAsAuthenticatedUser } = require("../../helpers/http/eventMembershipTestHelper");

describe("Leave Event API", () => {

    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* =============================
       LEAVE EVENT SUCCESS
    ============================= */

    it("should allow a user to leave an event", async () => {
        const { event } = await createOrganizerAndEvent();

        const participantAuth = await registerAndAuthenticateUser({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/leave`)
            .set(participantAuth.headers);

        const membership = await EventUserRole.findOne({
            where: {
                eventId: event.id,
                userId: participantAuth.user.userId
            }
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "User successfully left the event");

        expect(membership).not.toBeNull();
        expect(membership.deletedAt).not.toBeNull();
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    it("should reject leaving without token", async () => {
        const { event } = await createOrganizerAndEvent();

        const res = await request(app).delete(`/api/events/${event.id}/members/leave`);

        expect(res.statusCode).toBe(401);
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    it("should reject invalid eventId", async () => {
        const participantAuth = await registerAndAuthenticateUser({
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
        const { event } = await createOrganizerAndEvent();

        const participantAuth = await registerAndAuthenticateUser({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/leave`)
            .set(participantAuth.headers);

        expect(res.statusCode).toBe(404);
    });

    it("should reject organizer leaving own event", async () => {
        const { organizerAuth, event } = await createOrganizerAndEvent();

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/leave`)
            .set(organizerAuth.headers);

        expect(res.statusCode).toBe(403);
    });

    it("should reject leaving a past event", async () => {
        const { event } = await createOrganizerAndEvent({
            event: {
                startDateTime: "2020-01-01T10:00:00.000Z",
                endDateTime: "2020-01-01T12:00:00.000Z"
            }
        });

        const participantAuth = await registerAndAuthenticateUser({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/leave`)
            .set(participantAuth.headers);

        expect(res.statusCode).toBe(403);
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should reject leaving a nonexistent event", async () => {
        const participantAuth = await registerAndAuthenticateUser({
            name: "Participant",
            email: `missingleave${Date.now()}@test.com`
        });

        const res = await request(app)
            .delete("/api/events/999999/members/leave")
            .set(participantAuth.headers);

        expect(res.statusCode).toBe(404);
    });
});
