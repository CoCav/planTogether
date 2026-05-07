/* ==================================================
   EVENTS INTEGRATION - DELETE EVENT

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
================================================== */

const request = require("supertest");
const app = require("../../../src/app");

const { initDB, sequelize, User, Event, EventUserRole } = require("../../../src/models");

const { registerAndGetToken } = require("../../helpers/authHelper");
const { createEvent } = require("../../helpers/eventHelper");
const { joinEvent, updateMemberRole } = require("../../helpers/eventMembershipHelper");
const { getUserIdByEmail } = require("../../helpers/userHelper");

describe("Delete Event API", () => {

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
       EVENT DELETION
    ============================= */

    it("should allow organizer to delete event", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Event Deleter",
            email: `deleter${Date.now()}@test.com`
        });

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        const res = await request(app)
            .delete(`/api/events/${event.id}`)
            .set(organizerAuth.headers);

        expect(res.statusCode).toBe(200);

        expect(res.body).toHaveProperty(
            "message",
            "Event deleted successfully"
        );

        const getRes = await request(app).get(`/api/events/${event.id}`);

        expect(getRes.statusCode).toBe(404);
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    it("should reject delete without token", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Organizer",
            email: `unauthdelete${Date.now()}@test.com`
        });

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        const res = await request(app).delete(`/api/events/${event.id}`);

        expect(res.statusCode).toBe(401);
    });

    /* =============================
       AUTHORIZATION ERRORS
    ============================= */

    it("should reject delete by participant", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Organizer",
            email: `organizer${Date.now()}@test.com`
        });

        const participantAuth = await registerAndGetToken({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        await joinEvent(event.id, participantAuth.headers);

        const res = await request(app)
            .delete(`/api/events/${event.id}`)
            .set(participantAuth.headers);

        expect(res.statusCode).toBe(403);
    });

    it("should reject delete by co_organizer", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Organizer",
            email: `organizer${Date.now()}@test.com`
        });

        const coOrganizerAuth = await registerAndGetToken({
            name: "Co Organizer",
            email: `coorganizer${Date.now()}@test.com`
        });

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        await joinEvent(event.id, coOrganizerAuth.headers);

        const coOrganizerId = await getUserIdByEmail(coOrganizerAuth.email);

        await updateMemberRole(event.id, coOrganizerId, organizerAuth.headers, "co_organizer");

        const res = await request(app)
            .delete(`/api/events/${event.id}`)
            .set(coOrganizerAuth.headers);

        expect(res.statusCode).toBe(403);
    });

    it("should reject deleting nonexistent event", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Missing Event Deleter",
            email: `missingdelete${Date.now()}@test.com`
        });

        const res = await request(app)
            .delete("/api/events/999999")
            .set(organizerAuth.headers);

        expect(res.statusCode).toBe(403);
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    it("should reject invalid eventId", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Invalid ID User",
            email: `invalidid${Date.now()}@test.com`
        });

        const res = await request(app)
            .delete("/api/events/abc")
            .set(organizerAuth.headers);

        expect(res.statusCode).toBe(400);
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    it("should reject deleting past event", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Past Event Deleter",
            email: `pastdelete${Date.now()}@test.com`
        });

        const eventRes = await createEvent(
            organizerAuth.headers,
            {
                title: "Past Event",
                startDateTime: "2020-01-01T10:00:00.000Z",
                endDateTime: "2020-01-01T12:00:00.000Z"
            }
        );

        const event = eventRes.body.event;

        const res = await request(app)
            .delete(`/api/events/${event.id}`)
            .set(organizerAuth.headers);

        expect(res.statusCode).toBe(403);
    });
});
