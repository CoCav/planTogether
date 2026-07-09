/* =======================================================
   EVENT MEMBERSHIP INTEGRATION - GET EVENT MEMBERS TESTS

   Tests:
   - event members retrieval
   - participant membership retrieval
   - inactive membership exclusion
   - public access to event members endpoint
   - nonexistent event handling
   - invalid event ID validation

   Ensures:
   - event members are returned correctly
   - joined participants are included in the response
   - inactive memberships are excluded from public member listings
   - public users can access event members endpoint
   - invalid requests are rejected correctly
======================================================== */

const request = require("supertest");
const app = require("../../../src/app");

const { initializeTestDatabase, resetTestDatabase, closeTestDatabase } = require("../../helpers/database/dbTestHelper");

const { registerAndAuthenticateUser } = require("../../helpers/http/authTestHelper");
const { createOrganizerAndEvent } = require("../../helpers/http/eventTestHelper");
const { joinEventAsAuthenticatedUser } = require("../../helpers/http/eventMembershipTestHelper");

describe("Get Event Members API", () => {

    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* =============================
       EVENT MEMBERS RETRIEVAL
    ============================= */

    it("should retrieve event members", async () => {
        const { event } = await createOrganizerAndEvent({
            organizer: {
                name: "Event Creator",
                email: `creator${Date.now()}@test.com`
            }
        });

        const participantAuth = await registerAndAuthenticateUser({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

        const res = await request(app).get(`/api/events/${event.id}/members`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Event members retrieved successfully");
        expect(res.body).toHaveProperty("members");

        expect(Array.isArray(res.body.members)).toBe(true);

        const memberEmails = res.body.members.map((member) => member.email || member.User?.email);

        expect(memberEmails).toContain(participantAuth.email);
    });

    it("should include member avatars in event members response", async () => {
        const { event } = await createOrganizerAndEvent({
            organizer: {
                name: "Event Creator",
                email: `creator${Date.now()}@test.com`
            }
        });

        const participantAuth = await registerAndAuthenticateUser({
            name: "Participant Avatar",
            email: `participantavatar${Date.now()}@test.com`
        });

        await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

        const res = await request(app).get(`/api/events/${event.id}/members`);

        expect(res.statusCode).toBe(200);

        const participant = res.body.members.find(
            (member) => (member.email || member.User?.email) === participantAuth.email
        );

        expect(participant).toBeDefined();
        expect(participant.User).toHaveProperty("avatar");
    });

    it("should allow public access to event members endpoint", async () => {
        const { event } = await createOrganizerAndEvent({
            organizer: {
                name: "Event Creator",
                email: `creator${Date.now()}@test.com`
            }
        });

        const res = await request(app).get(`/api/events/${event.id}/members`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Event members retrieved successfully");
        expect(res.body).toHaveProperty("members");
    });

    it("should exclude inactive memberships from event members", async () => {
        const { event } = await createOrganizerAndEvent();

        const participantAuth = await registerAndAuthenticateUser({
            name: "Inactive Participant",
            email: `inactive${Date.now()}@test.com`
        });

        await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

        await request(app)
            .delete(`/api/events/${event.id}/members/leave`)
            .set(participantAuth.headers);

        const res = await request(app).get(`/api/events/${event.id}/members`);

        const memberEmails = res.body.members.map((member) => member.email || member.User?.email);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Event members retrieved successfully");

        expect(memberEmails).not.toContain(participantAuth.email);
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    it("should reject invalid eventId", async () => {
        const res = await request(app).get("/api/events/abc/members");

        expect(res.statusCode).toBe(400);
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should return 404 for nonexistent event", async () => {
        const res = await request(app).get("/api/events/999999/members");

        expect(res.statusCode).toBe(404);
    });
});
