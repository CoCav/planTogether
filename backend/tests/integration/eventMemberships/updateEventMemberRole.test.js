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

const { initializeTestDatabase, resetTestDatabase, closeTestDatabase } = require("../../helpers/database/dbTestHelper");

const { registerAndAuthenticateUser } = require("../../helpers/http/authTestHelper");
const { createOrganizerAndEvent } = require("../../helpers/http/eventTestHelper");
const {
    joinEventAsAuthenticatedUser,
    updateEventMemberRole
} = require("../../helpers/http/eventMembershipTestHelper");
const { findUserIdByEmail } = require("../../helpers/http/userTestHelper");

describe("Update Event Member Role API", () => {

    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* =============================
       ROLE UPDATE SUCCESS
    ============================= */

    it("should allow organizer to promote participant to co_organizer", async () => {
        const { organizerAuth, event } = await createOrganizerAndEvent();

        const participantAuth = await registerAndAuthenticateUser({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        const participantId = await findUserIdByEmail(participantAuth.email);

        await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

        const res = await updateEventMemberRole(event.id, participantId, organizerAuth.headers, EVENT_ROLES.CO_ORGANIZER);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Event member role updated successfully");

        expect(res.body.membership.role).toBe(EVENT_ROLES.CO_ORGANIZER);
    });

    it("should allow organizer to demote co_organizer to participant", async () => {
        const { organizerAuth, event } = await createOrganizerAndEvent();

        const coOrganizerAuth = await registerAndAuthenticateUser({
            name: "Co Organizer",
            email: `coorg${Date.now()}@test.com`
        });

        const coOrganizerId = await findUserIdByEmail(coOrganizerAuth.email);

        await joinEventAsAuthenticatedUser(event.id, coOrganizerAuth.headers);

        await updateEventMemberRole(event.id, coOrganizerId, organizerAuth.headers, EVENT_ROLES.CO_ORGANIZER);

        const res = await updateEventMemberRole(event.id, coOrganizerId, organizerAuth.headers, EVENT_ROLES.PARTICIPANT);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Event member role updated successfully");

        expect(res.body.membership.role).toBe(EVENT_ROLES.PARTICIPANT);
    });

    /* =============================
       AUTHORIZATION ERRORS
    ============================= */

    it("should reject role update by co_organizer", async () => {
        const { organizerAuth, event } = await createOrganizerAndEvent();

        const coOrganizerAuth = await registerAndAuthenticateUser({
            name: "Co Organizer",
            email: `coorg${Date.now()}@test.com`
        });

        const participantAuth = await registerAndAuthenticateUser({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        const coOrganizerId = await findUserIdByEmail(coOrganizerAuth.email);
        const participantId = await findUserIdByEmail(participantAuth.email);

        await joinEventAsAuthenticatedUser(event.id, coOrganizerAuth.headers);
        await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

        await updateEventMemberRole(event.id, coOrganizerId, organizerAuth.headers, EVENT_ROLES.CO_ORGANIZER);

        const res = await updateEventMemberRole(event.id, participantId, coOrganizerAuth.headers, EVENT_ROLES.CO_ORGANIZER);

        expect(res.statusCode).toBe(403);
    });

    it("should reject role update by participant", async () => {
        const { event } = await createOrganizerAndEvent();

        const participantAuth = await registerAndAuthenticateUser({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        const targetParticipantAuth = await registerAndAuthenticateUser({
            name: "Target Participant",
            email: `target${Date.now()}@test.com`
        });

        const targetParticipantId = await findUserIdByEmail(targetParticipantAuth.email);

        await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);
        await joinEventAsAuthenticatedUser(event.id, targetParticipantAuth.headers);

        const res = await updateEventMemberRole(event.id, targetParticipantId, participantAuth.headers, EVENT_ROLES.CO_ORGANIZER);

        expect(res.statusCode).toBe(403);
    });

    it("should reject changing event creator role", async () => {
        const { organizerAuth, event } = await createOrganizerAndEvent();

        const organizerId = await findUserIdByEmail(organizerAuth.email);

        const res = await updateEventMemberRole(event.id, organizerId, organizerAuth.headers, EVENT_ROLES.PARTICIPANT);

        expect(res.statusCode).toBe(403);
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    it("should reject missing newRole", async () => {
        const { organizerAuth, event } = await createOrganizerAndEvent();

        const participantAuth = await registerAndAuthenticateUser({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        const participantId = await findUserIdByEmail(participantAuth.email);

        await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

        const res = await request(app)
            .put(`/api/events/${event.id}/members/${participantId}/role`)
            .set(organizerAuth.headers)
            .send({});

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid newRole", async () => {
        const { organizerAuth, event } = await createOrganizerAndEvent();

        const participantAuth = await registerAndAuthenticateUser({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        const participantId = await findUserIdByEmail(participantAuth.email);

        await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

        const res = await request(app)
            .put(`/api/events/${event.id}/members/${participantId}/role`)
            .set(organizerAuth.headers)
            .send({
                newRole: "admin"
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid eventId", async () => {
        const { organizerAuth } = await createOrganizerAndEvent();

        const res = await request(app)
            .put("/api/events/abc/members/1/role")
            .set(organizerAuth.headers)
            .send({
                newRole: EVENT_ROLES.PARTICIPANT
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid userId", async () => {
        const { organizerAuth } = await createOrganizerAndEvent();

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
        const { organizerAuth, event } = await createOrganizerAndEvent();

        const participantAuth = await registerAndAuthenticateUser({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        const participantId = await findUserIdByEmail(participantAuth.email);

        await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

        const res = await updateEventMemberRole(event.id, participantId, organizerAuth.headers, EVENT_ROLES.PARTICIPANT);

        expect(res.statusCode).toBe(400);
    });

    it("should reject updating role for past event", async () => {
        const { organizerAuth, event } = await createOrganizerAndEvent({
            event: {
                startDateTime: "2020-01-01T10:00:00.000Z",
                endDateTime: "2020-01-01T12:00:00.000Z"
            }
        });

        const participantAuth = await registerAndAuthenticateUser({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        const participantId = await findUserIdByEmail(participantAuth.email);

        await EventUserRole.create({
            eventId: event.id,
            userId: participantId,
            role: EVENT_ROLES.PARTICIPANT
        });

        const res = await updateEventMemberRole(event.id, participantId, organizerAuth.headers, EVENT_ROLES.CO_ORGANIZER);

        expect(res.statusCode).toBe(403);
    });

    it("should reject updating nonexistent member", async () => {
        const { organizerAuth, event } = await createOrganizerAndEvent();

        const res = await updateEventMemberRole(event.id, 999999, organizerAuth.headers, EVENT_ROLES.PARTICIPANT);

        expect(res.statusCode).toBe(404);
    });

    it("should reject updating role for inactive membership", async () => {
        const { organizerAuth, event } = await createOrganizerAndEvent();

        const participantAuth = await registerAndAuthenticateUser({
            name: "Inactive Participant",
            email: `inactive${Date.now()}@test.com`
        });

        const participantId = await findUserIdByEmail(participantAuth.email);

        await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

        await request(app)
            .delete(`/api/events/${event.id}/members/leave`)
            .set(participantAuth.headers);

        const res = await updateEventMemberRole(event.id, participantId, organizerAuth.headers, EVENT_ROLES.CO_ORGANIZER);

        expect(res.statusCode).toBe(404);
    });
});
