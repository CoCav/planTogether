/* ==============================================================
   EVENT MEMBERSHIP INTEGRATION - UPDATE EVENT MEMBER ROLE TESTS

   Tests:
   - organizer role update
   - co-organizer role restrictions
   - participant role restrictions
   - invalid role validation
   - same role update rejection
   - inactive member role update rejection
   - event creator protection
   - nonexistent member handling
   - invalid params validation

   Ensures:
   - organizers can manage participant roles
   - non-organizers cannot manage roles
   - inactive memberships cannot be updated
   - protected memberships cannot be modified
   - invalid role updates are rejected correctly
   - shared event role constants are used for valid role scenarios
============================================================== */

const request = require("supertest");
const app = require("../../../src/app");

const { EventUserRole } = require("../../../src/models");

const { EVENT_ROLES } = require("../../../src/constants/eventRoles");

const { initDB, resetDB, closeDB } = require("../../helpers/database/dbTestHelper");

const { registerAndGetToken } = require("../../helpers/api/authHelper");
const { createEventWithOrganizer } = require("../../helpers/api/eventHelper");
const { joinEvent, updateMemberRole } = require("../../helpers/api/eventMembershipHelper");
const { getUserIdByEmail } = require("../../helpers/api/userHelper");

describe("Update Event Member Role API", () => {

    beforeAll(initDB);
    afterEach(resetDB);
    afterAll(closeDB);

    /* =============================
       ROLE UPDATE SUCCESS
    ============================= */

    it("should allow organizer to promote participant to co_organizer", async () => {
        const { organizerAuth, event } = await createEventWithOrganizer();

        const participantAuth = await registerAndGetToken({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        const participantId = await getUserIdByEmail(participantAuth.email);

        await joinEvent(event.id, participantAuth.headers);

        const res = await updateMemberRole(event.id, participantId, organizerAuth.headers, EVENT_ROLES.CO_ORGANIZER);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Event member role updated successfully");

        expect(res.body.membership.role).toBe(EVENT_ROLES.CO_ORGANIZER);
    });

    it("should allow organizer to demote co_organizer to participant", async () => {
        const { organizerAuth, event } = await createEventWithOrganizer();

        const coOrganizerAuth = await registerAndGetToken({
            name: "Co Organizer",
            email: `coorg${Date.now()}@test.com`
        });

        const coOrganizerId = await getUserIdByEmail(coOrganizerAuth.email);

        await joinEvent(event.id, coOrganizerAuth.headers);

        await updateMemberRole(event.id, coOrganizerId, organizerAuth.headers, EVENT_ROLES.CO_ORGANIZER);

        const res = await updateMemberRole(event.id, coOrganizerId, organizerAuth.headers, EVENT_ROLES.PARTICIPANT);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Event member role updated successfully");

        expect(res.body.membership.role).toBe(EVENT_ROLES.PARTICIPANT);
    });

    /* =============================
       AUTHORIZATION ERRORS
    ============================= */

    it("should reject role update by co_organizer", async () => {
        const { organizerAuth, event } = await createEventWithOrganizer();

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

        await joinEvent(event.id, coOrganizerAuth.headers);
        await joinEvent(event.id, participantAuth.headers);

        await updateMemberRole(event.id, coOrganizerId, organizerAuth.headers, EVENT_ROLES.CO_ORGANIZER);

        const res = await updateMemberRole(event.id, participantId, coOrganizerAuth.headers, EVENT_ROLES.CO_ORGANIZER);

        expect(res.statusCode).toBe(403);
    });

    it("should reject role update by participant", async () => {
        const { event } = await createEventWithOrganizer();

        const participantAuth = await registerAndGetToken({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        const targetParticipantAuth = await registerAndGetToken({
            name: "Target Participant",
            email: `target${Date.now()}@test.com`
        });

        const targetParticipantId = await getUserIdByEmail(targetParticipantAuth.email);

        await joinEvent(event.id, participantAuth.headers);
        await joinEvent(event.id, targetParticipantAuth.headers);

        const res = await updateMemberRole(event.id, targetParticipantId, participantAuth.headers, EVENT_ROLES.CO_ORGANIZER);

        expect(res.statusCode).toBe(403);
    });

    it("should reject changing event creator role", async () => {
        const { organizerAuth, event } = await createEventWithOrganizer();

        const organizerId = await getUserIdByEmail(organizerAuth.email);

        const res = await updateMemberRole(event.id, organizerId, organizerAuth.headers, EVENT_ROLES.PARTICIPANT);

        expect(res.statusCode).toBe(403);
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    it("should reject missing newRole", async () => {
        const { organizerAuth, event } = await createEventWithOrganizer();

        const participantAuth = await registerAndGetToken({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        const participantId = await getUserIdByEmail(participantAuth.email);

        await joinEvent(event.id, participantAuth.headers);

        const res = await request(app)
            .put(`/api/events/${event.id}/members/${participantId}/role`)
            .set(organizerAuth.headers)
            .send({});

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid newRole", async () => {
        const { organizerAuth, event } = await createEventWithOrganizer();

        const participantAuth = await registerAndGetToken({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        const participantId = await getUserIdByEmail(participantAuth.email);

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
        const { organizerAuth } = await createEventWithOrganizer();

        const res = await request(app)
            .put("/api/events/abc/members/1/role")
            .set(organizerAuth.headers)
            .send({
                newRole: EVENT_ROLES.PARTICIPANT
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid userId", async () => {
        const { organizerAuth } = await createEventWithOrganizer();

        const res = await request(app)
            .put("/api/events/1/members/abc/role")
            .set(organizerAuth.headers)
            .send({
                newRole: EVENT_ROLES.PARTICIPANT
            });

        expect(res.statusCode).toBe(400);
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    it("should reject updating member to same role", async () => {
        const { organizerAuth, event } = await createEventWithOrganizer();

        const participantAuth = await registerAndGetToken({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        const participantId = await getUserIdByEmail(participantAuth.email);

        await joinEvent(event.id, participantAuth.headers);

        const res = await updateMemberRole(event.id, participantId, organizerAuth.headers, EVENT_ROLES.PARTICIPANT);

        expect(res.statusCode).toBe(400);
    });

    it("should reject updating role for past event", async () => {
        const { organizerAuth, event } = await createEventWithOrganizer({
            event: {
                startDateTime: "2020-01-01T10:00:00.000Z",
                endDateTime: "2020-01-01T12:00:00.000Z"
            }
        });

        const participantAuth = await registerAndGetToken({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        const participantId = await getUserIdByEmail(participantAuth.email);

        await EventUserRole.create({
            eventId: event.id,
            userId: participantId,
            role: EVENT_ROLES.PARTICIPANT
        });

        const res = await updateMemberRole(event.id, participantId, organizerAuth.headers, EVENT_ROLES.CO_ORGANIZER);

        expect(res.statusCode).toBe(403);
    });

    it("should reject updating nonexistent member", async () => {
        const { organizerAuth, event } = await createEventWithOrganizer();

        const res = await updateMemberRole(event.id, 999999, organizerAuth.headers, EVENT_ROLES.PARTICIPANT);

        expect(res.statusCode).toBe(404);
    });

    it("should reject updating role for inactive membership", async () => {
        const { organizerAuth, event } = await createEventWithOrganizer();

        const participantAuth = await registerAndGetToken({
            name: "Inactive Participant",
            email: `inactive${Date.now()}@test.com`
        });

        const participantId = await getUserIdByEmail(participantAuth.email);

        await joinEvent(event.id, participantAuth.headers);

        await request(app)
            .delete(`/api/events/${event.id}/members/leave`)
            .set(participantAuth.headers);

        const res = await updateMemberRole(event.id, participantId, organizerAuth.headers, EVENT_ROLES.CO_ORGANIZER);

        expect(res.statusCode).toBe(404);
    });
});
