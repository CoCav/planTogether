/* =========================================================
   EVENT MEMBERSHIP INTEGRATION - REMOVE EVENT MEMBER TESTS

   Tests:
   - organizer member removal
   - co-organizer member removal
   - participant removal restriction
   - organizer protection
   - event creator protection
   - co-organizer protection
   - nonexistent member handling
   - past event restriction
   - invalid params validation

   Ensures:
   - authorized staff members can remove participants
   - protected memberships cannot be removed
   - unauthorized removals are rejected correctly
========================================================= */

const request = require("supertest");
const app = require("../../../src/app");

const { initDB, sequelize, User, Event, EventUserRole } = require("../../../src/models");

const { registerAndGetToken } = require("../../helpers/authHelper");
const { createEvent } = require("../../helpers/eventHelper");
const { joinEvent, updateMemberRole } = require("../../helpers/eventMembershipHelper");
const { getUserIdByEmail } = require("../../helpers/userHelper");

describe("Remove Event Member API", () => {

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
       MEMBER REMOVAL SUCCESS
    ============================= */

    it("should allow organizer to remove participant", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Organizer",
            email: `organizer${Date.now()}@test.com`
        });

        const participantAuth = await registerAndGetToken({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        const participantId = await getUserIdByEmail(participantAuth.email);

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        await joinEvent(event.id, participantAuth.headers);

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/${participantId}`)
            .set(organizerAuth.headers);

        expect(res.statusCode).toBe(200);
    });

    it("should allow co_organizer to remove participant", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Organizer",
            email: `organizer${Date.now()}@test.com`
        });

        const coOrganizerAuth = await registerAndGetToken({
            name: "Co Organizer",
            email: `coorg${Date.now()}@test.com`
        });

        const participantAuth = await registerAndGetToken({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        const coOrganizerId = await getUserIdByEmail(coOrganizerAuth.email);

        const participantId = await getUserIdByEmail(participantAuth.email);

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        await joinEvent(event.id, coOrganizerAuth.headers);
        await joinEvent(event.id, participantAuth.headers);

        await updateMemberRole(event.id, coOrganizerId, organizerAuth.headers, "co_organizer");

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/${participantId}`)
            .set(coOrganizerAuth.headers);

        expect(res.statusCode).toBe(200);
    });

    /* =============================
       AUTHORIZATION ERRORS
    ============================= */

    it("should reject removal by participant", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Organizer",
            email: `organizer${Date.now()}@test.com`
        });

        const participantAuth = await registerAndGetToken({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        const targetParticipantAuth = await registerAndGetToken({
            name: "Target Participant",
            email: `target${Date.now()}@test.com`
        });

        const targetParticipantId = await getUserIdByEmail(targetParticipantAuth.email);

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        await joinEvent(event.id, participantAuth.headers);
        await joinEvent(event.id, targetParticipantAuth.headers);

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/${targetParticipantId}`)
            .set(participantAuth.headers);

        expect(res.statusCode).toBe(403);
    });

    it("should reject organizer removing themselves", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Organizer",
            email: `organizer${Date.now()}@test.com`
        });

        const organizerId = await getUserIdByEmail(organizerAuth.email);

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/${organizerId}`)
            .set(organizerAuth.headers);

        expect(res.statusCode).toBe(403);
    });

    it("should reject removing event creator", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Organizer",
            email: `organizer${Date.now()}@test.com`
        });

        const organizerId = await getUserIdByEmail(organizerAuth.email);

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        const coOrganizerAuth = await registerAndGetToken({
            name: "Co Organizer",
            email: `coorg${Date.now()}@test.com`
        });

        const coOrganizerId = await getUserIdByEmail(coOrganizerAuth.email);

        await joinEvent(event.id, coOrganizerAuth.headers);

        await updateMemberRole(event.id, coOrganizerId, organizerAuth.headers, "co_organizer");

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/${organizerId}`)
            .set(coOrganizerAuth.headers);

        expect(res.statusCode).toBe(403);
    });

    it("should reject co_organizer removing another co_organizer", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Organizer",
            email: `organizer${Date.now()}@test.com`
        });

        const firstCoOrganizerAuth = await registerAndGetToken({
            name: "First Co Organizer",
            email: `coorg1${Date.now()}@test.com`
        });

        const secondCoOrganizerAuth = await registerAndGetToken({
            name: "Second Co Organizer",
            email: `coorg2${Date.now()}@test.com`
        });

        const firstCoOrganizerId = await getUserIdByEmail(firstCoOrganizerAuth.email);
        const secondCoOrganizerId = await getUserIdByEmail(secondCoOrganizerAuth.email);

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        await joinEvent(event.id, firstCoOrganizerAuth.headers);
        await joinEvent(event.id, secondCoOrganizerAuth.headers);

        await updateMemberRole(event.id, firstCoOrganizerId, organizerAuth.headers, "co_organizer");
        await updateMemberRole(event.id, secondCoOrganizerId, organizerAuth.headers, "co_organizer");

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/${secondCoOrganizerId}`)
            .set(firstCoOrganizerAuth.headers);

        expect(res.statusCode).toBe(403);
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    it("should reject removing nonexistent member", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Organizer",
            email: `organizer${Date.now()}@test.com`
        });

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/999999`)
            .set(organizerAuth.headers);

        expect(res.statusCode).toBe(404);
    });

    it("should reject removing member from past event", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Organizer",
            email: `organizer${Date.now()}@test.com`
        });

        const participantAuth = await registerAndGetToken({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        const participantId = await getUserIdByEmail(participantAuth.email);

        const eventRes = await createEvent(
            organizerAuth.headers,
            {
                startDateTime: "2020-01-01T10:00:00.000Z",
                endDateTime: "2020-01-01T12:00:00.000Z"
            }
        );

        const event = eventRes.body.event;

        await EventUserRole.create({
            eventId: event.id,
            userId: participantId,
            role: "participant"
        });

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/${participantId}`)
            .set(organizerAuth.headers);

        expect(res.statusCode).toBe(403);
    });

    /* =============================
        VALIDATION ERRORS
    ============================= */

    it("should reject invalid eventId", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Organizer",
            email: `organizer${Date.now()}@test.com`
        });

        const res = await request(app)
            .delete("/api/events/abc/members/1")
            .set(organizerAuth.headers);

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid userId", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Organizer",
            email: `organizer${Date.now()}@test.com`
        });

        const res = await request(app)
            .delete("/api/events/1/members/abc")
            .set(organizerAuth.headers);

        expect(res.statusCode).toBe(400);
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should reject removing member from nonexistent event", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Organizer",
            email: `organizer${Date.now()}@test.com`
        });

        const res = await request(app)
            .delete("/api/events/999999/members/1")
            .set(organizerAuth.headers);

        expect(res.statusCode).toBe(403);
    });
});
