/* =======================================================
   EVENT MEMBERSHIP INTEGRATION - GET EVENT MEMBERS TESTS

   Tests:
   - event members retrieval
   - participant membership retrieval
   - public access to event members endpoint
   - nonexistent event handling
   - invalid event ID validation

   Ensures:
   - event members are returned correctly
   - joined participants are included in the response
   - public users can access event members endpoint
   - invalid requests are rejected correctly
======================================================== */

const request = require("supertest");
const app = require("../../../src/app");

const { initDB, resetDB, closeDB } = require("../../helpers/database/dbTestHelper");

const { registerAndGetToken } = require("../../helpers/api/authHelper");
const { createEventWithOrganizer } = require("../../helpers/api/eventHelper");
const { joinEvent } = require("../../helpers/api/eventMembershipHelper");

describe("Get Event Members API", () => {

    beforeAll(initDB);
    afterEach(resetDB);
    afterAll(closeDB);

    /* =============================
       EVENT MEMBERS RETRIEVAL
    ============================= */

    it("should retrieve event members", async () => {
        const { event } = await createEventWithOrganizer({
            organizer: {
                name: "Event Creator",
                email: `creator${Date.now()}@test.com`
            }
        });

        const participantAuth = await registerAndGetToken({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        await joinEvent(event.id, participantAuth.headers);

        const res = await request(app).get(`/api/events/${event.id}/members`);

        expect(res.statusCode).toBe(200);

        expect(res.body).toHaveProperty("members");
        expect(Array.isArray(res.body.members)).toBe(true);

        const memberEmails = res.body.members.map((member) => member.email || member.User?.email);

        expect(memberEmails).toContain(participantAuth.email);
    });

    it("should allow public access to event members endpoint", async () => {
        const { event } = await createEventWithOrganizer({
            organizer: {
                name: "Event Creator",
                email: `creator${Date.now()}@test.com`
            }
        });

        const res = await request(app).get(`/api/events/${event.id}/members`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("members");
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
