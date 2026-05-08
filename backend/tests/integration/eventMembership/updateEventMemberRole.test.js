/* ==============================================================
   EVENT MEMBERSHIP INTEGRATION - UPDATE EVENT MEMBER ROLE TESTS

   Tests:
   - organizer role update
   - co-organizer role restrictions
   - participant role restrictions
   - invalid role validation
   - same role update rejection
   - event creator protection
   - nonexistent member handling
   - invalid params validation

   Ensures:
   - organizers can manage participant roles
   - non-organizers cannot manage roles
   - protected memberships cannot be modified
   - invalid role updates are rejected correctly
============================================================= */

const request = require("supertest");
const app = require("../../../src/app");

const { initDB, sequelize, User, Event, EventUserRole } = require("../../../src/models");

const { registerAndGetToken } = require("../../helpers/authHelper");
const { createEvent } = require("../../helpers/eventHelper");
const { joinEvent, updateMemberRole } = require("../../helpers/eventMembershipHelper");
const { getUserIdByEmail } = require("../../helpers/userHelper");

describe("Update Event Member Role API", () => {

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
       ROLE MANAGEMENT SUCCESS
    ============================= */

    it("should allow organizer to promote participant to co_organizer", async () => {
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

        const res = await updateMemberRole(event.id, participantId, organizerAuth.headers, "co_organizer");

        expect(res.statusCode).toBe(200);
        expect(res.body.membership.role).toBe("co_organizer");
    });

    it("should allow organizer to demote co_organizer to participant", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Organizer",
            email: `organizer${Date.now()}@test.com`
        });

        const coOrganizerAuth = await registerAndGetToken({
            name: "Co Organizer",
            email: `coorg${Date.now()}@test.com`
        });

        const coOrganizerId = await getUserIdByEmail(coOrganizerAuth.email);

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        await joinEvent(event.id, coOrganizerAuth.headers);

        await updateMemberRole(event.id, coOrganizerId, organizerAuth.headers, "co_organizer");
        const res = await updateMemberRole(event.id, coOrganizerId, organizerAuth.headers, "participant");

        expect(res.statusCode).toBe(200);

        expect(res.body.membership.role).toBe("participant");
    });

    /* =============================
       AUTHORIZATION ERRORS
    ============================= */

    it("should reject role update by co_organizer", async () => {
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
        const res = await updateMemberRole(event.id, participantId, coOrganizerAuth.headers, "co_organizer");

        expect(res.statusCode).toBe(403);
    });

    it("should reject role update by participant", async () => {
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

        const res = await updateMemberRole(event.id, targetParticipantId, participantAuth.headers, "co_organizer");

        expect(res.statusCode).toBe(403);
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    it("should reject updating member to same role", async () => {
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

        const res = await updateMemberRole(event.id, participantId, organizerAuth.headers, "participant");

        expect(res.statusCode).toBe(400);
    });

    it("should reject changing event creator role", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Organizer",
            email: `organizer${Date.now()}@test.com`
        });

        const organizerId = await getUserIdByEmail(organizerAuth.email);

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        const res = await updateMemberRole(event.id, organizerId, organizerAuth.headers, "participant");

        expect(res.statusCode).toBe(403);
    });

    it("should reject updating role for past event", async () => {
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

        const res = await updateMemberRole(event.id, participantId, organizerAuth.headers, "co_organizer");

        expect(res.statusCode).toBe(403);
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    it("should reject missing newRole", async () => {
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
            .put(`/api/events/${event.id}/members/${participantId}/role`)
            .set(organizerAuth.headers)
            .send({});

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid newRole", async () => {
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
            .put(`/api/events/${event.id}/members/${participantId}/role`)
            .set(organizerAuth.headers)
            .send({
                newRole: "admin"
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid eventId", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Organizer",
            email: `organizer${Date.now()}@test.com`
        });

        const res = await request(app)
            .put("/api/events/abc/members/1/role")
            .set(organizerAuth.headers)
            .send({
                newRole: "participant"
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid userId", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Organizer",
            email: `organizer${Date.now()}@test.com`
        });

        const res = await request(app)
            .put("/api/events/1/members/abc/role")
            .set(organizerAuth.headers)
            .send({
                newRole: "participant"
            });

        expect(res.statusCode).toBe(400);
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should reject updating nonexistent member", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Organizer",
            email: `organizer${Date.now()}@test.com`
        });

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        const res = await updateMemberRole(event.id, 999999, organizerAuth.headers, "participant");

        expect(res.statusCode).toBe(404);
    });
});
