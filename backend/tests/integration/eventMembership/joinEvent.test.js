/* ==================================================
   EVENT MEMBERSHIP INTEGRATION - JOIN EVENT TESTS

   Tests:
   - joining an event
   - authentication requirement
   - duplicate join rejection
   - nonexistent event handling
   - past event restriction
   - registration deadline restriction
   - max participants restriction
   - invalid event ID validation

   Ensures:
   - authenticated users can join events
   - duplicate memberships are prevented
   - expired or full events reject new members
   - invalid join requests are rejected correctly
================================================== */

const request = require("supertest");
const app = require("../../../src/app");

const { initDB, resetDB, closeDB } = require("../../helpers/database/dbTestHelper");

const { registerAndGetToken } = require("../../helpers/api/authHelper");
const { createEvent } = require("../../helpers/api/eventHelper");
const { joinEvent } = require("../../helpers/api/eventMembershipHelper");

describe("Join Event API", () => {

    beforeAll(initDB);
    afterEach(resetDB);
    afterAll(closeDB);

    /* =============================
       JOIN SUCCESS
    ============================= */

    it("should allow an authenticated user to join an event", async () => {
        const eventCreatorAuth = await registerAndGetToken({
            name: "Creator",
            email: `creator${Date.now()}@test.com`
        });

        const eventRes = await createEvent(eventCreatorAuth.headers);
        const event = eventRes.body.event;

        const participantAuth = await registerAndGetToken({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        const res = await joinEvent(event.id, participantAuth.headers);

        expect(res.statusCode).toBe(200);
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    it("should reject joining without token", async () => {
        const eventCreatorAuth = await registerAndGetToken({
            name: "Creator",
            email: `creator${Date.now()}@test.com`
        });

        const eventRes = await createEvent(eventCreatorAuth.headers);
        const event = eventRes.body.event;

        const res = await request(app).post(`/api/events/${event.id}/members/join`);

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
            .post("/api/events/abc/members/join")
            .set(participantAuth.headers);

        expect(res.statusCode).toBe(400);
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    it("should reject joining the same event twice", async () => {
        const eventCreatorAuth = await registerAndGetToken({
            name: "Creator",
            email: `creator${Date.now()}@test.com`
        });

        const eventRes = await createEvent(eventCreatorAuth.headers);
        const event = eventRes.body.event;

        const participantAuth = await registerAndGetToken({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        await joinEvent(event.id, participantAuth.headers);

        const res = await joinEvent(event.id, participantAuth.headers);

        expect(res.statusCode).toBe(409);
    });

    it("should reject joining a past event", async () => {
        const eventCreatorAuth = await registerAndGetToken({
            name: "Creator",
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

        const res = await joinEvent(event.id, participantAuth.headers);

        expect(res.statusCode).toBe(403);
    });

    it("should reject joining after registration deadline", async () => {
        const eventCreatorAuth = await registerAndGetToken({
            name: "Creator",
            email: `creator${Date.now()}@test.com`
        });

        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

        const eventRes = await createEvent(
            eventCreatorAuth.headers,
            {
                registrationDeadline: yesterday,
                startDateTime: tomorrow,
                endDateTime: nextWeek
            }
        );

        const event = eventRes.body.event;

        const participantAuth = await registerAndGetToken({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        const res = await joinEvent(event.id, participantAuth.headers);

        expect(res.statusCode).toBe(409);
    });

    it("should reject joining when event is full", async () => {
        const eventCreatorAuth = await registerAndGetToken({
            name: "Creator",
            email: `creator${Date.now()}@test.com`
        });

        const eventRes = await createEvent(
            eventCreatorAuth.headers,
            {
                maxParticipants: 1
            }
        );

        const event = eventRes.body.event;

        const firstParticipantAuth = await registerAndGetToken({
            name: "First Participant",
            email: `firstparticipant${Date.now()}@test.com`
        });

        await joinEvent(event.id, firstParticipantAuth.headers);

        const secondParticipantAuth = await registerAndGetToken({
            name: "Second Participant",
            email: `secondparticipant${Date.now()}@test.com`
        });

        const res = await joinEvent(event.id, secondParticipantAuth.headers);

        expect(res.statusCode).toBe(409);
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should reject joining a nonexistent event", async () => {
        const participantAuth = await registerAndGetToken({
            name: "Participant",
            email: `missingjoin${Date.now()}@test.com`
        });

        const res = await request(app)
            .post("/api/events/999999/members/join")
            .set(participantAuth.headers);

        expect(res.statusCode).toBe(404);
    });
});
