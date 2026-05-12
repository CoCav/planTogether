/* =============================================
   EVENTS INTEGRATION - DELETE EVENT TESTS

   Tests:
   - organizer event deletion
   - authentication protection
   - participant delete rejection
   - co-organizer delete rejection
   - nonexistent event handling
   - past event deletion rejection
   - invalid event ID validation

   Ensures:
   - only organizers can delete events
   - deleted events are no longer retrievable
   - role middleware protects delete route
   - business rules prevent deleting past events
   - shared event role constants are used for valid role scenarios
=============================================== */

const request = require("supertest");
const app = require("../../../src/app");

const { EVENT_ROLES } = require("../../../src/constants/eventRoles");

const { initDB, resetDB, closeDB } = require("../../helpers/database/dbTestHelper");

const { registerAndGetToken } = require("../../helpers/api/authHelper");
const { createEventWithOrganizer } = require("../../helpers/api/eventHelper");
const { joinEvent, updateMemberRole } = require("../../helpers/api/eventMembershipHelper");
const { getUserIdByEmail } = require("../../helpers/api/userHelper");

describe("Delete Event API", () => {

    beforeAll(initDB);
    afterEach(resetDB);
    afterAll(closeDB);

    /* =============================
       EVENT DELETION SUCCESS
    ============================= */

    it("should allow organizer to delete event", async () => {
        const { organizerAuth, event } = await createEventWithOrganizer({
            organizer: {
                name: "Event Deleter",
                email: `deleter${Date.now()}@test.com`
            }
        });

        const res = await request(app)
            .delete(`/api/events/${event.id}`)
            .set(organizerAuth.headers);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Event deleted successfully");

        const getRes = await request(app).get(`/api/events/${event.id}`);

        expect(getRes.statusCode).toBe(404);
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    it("should reject delete without token", async () => {
        const { event } = await createEventWithOrganizer({
            organizer: {
                name: "Organizer",
                email: `unauthdelete${Date.now()}@test.com`
            }
        });

        const res = await request(app).delete(`/api/events/${event.id}`);

        expect(res.statusCode).toBe(401);
    });

    /* =============================
       AUTHORIZATION ERRORS
    ============================= */

    it("should reject delete by participant", async () => {
        const { organizerAuth, event } = await createEventWithOrganizer({
            organizer: {
                name: "Organizer",
                email: `organizer${Date.now()}@test.com`
            }
        });

        const participantAuth = await registerAndGetToken({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        await joinEvent(event.id, participantAuth.headers);

        const res = await request(app)
            .delete(`/api/events/${event.id}`)
            .set(participantAuth.headers);

        expect(res.statusCode).toBe(403);
    });

    it("should reject delete by co_organizer", async () => {
        const { organizerAuth, event } = await createEventWithOrganizer({
            organizer: {
                name: "Organizer",
                email: `organizer${Date.now()}@test.com`
            }
        });

        const coOrganizerAuth = await registerAndGetToken({
            name: "Co Organizer",
            email: `coorganizer${Date.now()}@test.com`
        });

        await joinEvent(event.id, coOrganizerAuth.headers);

        const coOrganizerId = await getUserIdByEmail(coOrganizerAuth.email);

        await updateMemberRole(event.id, coOrganizerId, organizerAuth.headers, EVENT_ROLES.CO_ORGANIZER);

        const res = await request(app)
            .delete(`/api/events/${event.id}`)
            .set(coOrganizerAuth.headers);

        expect(res.statusCode).toBe(403);
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    it("should reject deleting past event", async () => {
        const { organizerAuth, event } = await createEventWithOrganizer({
            organizer: {
                name: "Past Event Deleter",
                email: `pastdelete${Date.now()}@test.com`
            },
            event: {
                title: "Past Event",
                startDateTime: "2020-01-01T10:00:00.000Z",
                endDateTime: "2020-01-01T12:00:00.000Z"
            }
        });

        const res = await request(app)
            .delete(`/api/events/${event.id}`)
            .set(organizerAuth.headers);

        expect(res.statusCode).toBe(403);
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    it("should reject invalid eventId", async () => {
        const { organizerAuth } = await createEventWithOrganizer({
            organizer: {
                name: "Invalid ID User",
                email: `invalidid${Date.now()}@test.com`
            }
        });

        const res = await request(app)
            .delete("/api/events/abc")
            .set(organizerAuth.headers);

        expect(res.statusCode).toBe(400);
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should reject deleting inaccessible event", async () => {
        const { organizerAuth } = await createEventWithOrganizer({
            organizer: {
                name: "Missing Event Deleter",
                email: `missingdelete${Date.now()}@test.com`
            }
        });

        const res = await request(app)
            .delete("/api/events/999999")
            .set(organizerAuth.headers);

        expect(res.statusCode).toBe(403);
    });
});
