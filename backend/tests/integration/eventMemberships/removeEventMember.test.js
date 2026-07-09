/* =========================================================
   EVENT MEMBERSHIP INTEGRATION - REMOVE EVENT MEMBER TESTS

   Tests:
   - organizer member removal
   - co-organizer member removal
   - participant removal restriction
   - membership soft deletion on removal
   - organizer protection
   - event creator protection
   - co-organizer protection
   - nonexistent member handling
   - past event restriction
   - invalid params validation

   Ensures:
   - authorized staff members can remove participants
   - protected memberships cannot be removed
   - removed memberships keep historical data
   - memberships are soft-deleted instead of permanently removed
   - unauthorized removals are rejected correctly
   - shared event role constants are used for valid role scenarios
========================================================= */

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

describe("Remove Event Member API", () => {

    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* =============================
       MEMBER REMOVAL SUCCESS
    ============================= */

    it("should allow organizer to remove participant", async () => {
        const { organizerAuth, event } = await createOrganizerAndEvent();

        const participantAuth = await registerAndAuthenticateUser({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        const participantId = await findUserIdByEmail(participantAuth.email);

        await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/${participantId}`)
            .set(organizerAuth.headers);

        const membership = await EventUserRole.findOne({
            where: {
                eventId: event.id,
                userId: participantId
            }
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Event member removed successfully");

        expect(membership).not.toBeNull();
        expect(membership.deletedAt).not.toBeNull();
    });

    it("should allow co_organizer to remove participant", async () => {
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

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/${participantId}`)
            .set(coOrganizerAuth.headers);

        const membership = await EventUserRole.findOne({
            where: {
                eventId: event.id,
                userId: participantId
            }
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Event member removed successfully");

        expect(membership).not.toBeNull();
        expect(membership.deletedAt).not.toBeNull();
    });

    /* =============================
       AUTHORIZATION ERRORS
    ============================= */

    it("should reject removal by participant", async () => {
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

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/${targetParticipantId}`)
            .set(participantAuth.headers);

        expect(res.statusCode).toBe(403);
    });

    it("should reject organizer removing themselves", async () => {
        const { organizerAuth, event } = await createOrganizerAndEvent();

        const organizerId = await findUserIdByEmail(organizerAuth.email);

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/${organizerId}`)
            .set(organizerAuth.headers);

        expect(res.statusCode).toBe(403);
    });

    it("should reject removing event creator", async () => {
        const { organizerAuth, event } = await createOrganizerAndEvent();

        const organizerId = await findUserIdByEmail(organizerAuth.email);

        const coOrganizerAuth = await registerAndAuthenticateUser({
            name: "Co Organizer",
            email: `coorg${Date.now()}@test.com`
        });

        const coOrganizerId = await findUserIdByEmail(coOrganizerAuth.email);

        await joinEventAsAuthenticatedUser(event.id, coOrganizerAuth.headers);

        await updateEventMemberRole(event.id, coOrganizerId, organizerAuth.headers, EVENT_ROLES.CO_ORGANIZER);

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/${organizerId}`)
            .set(coOrganizerAuth.headers);

        expect(res.statusCode).toBe(403);
    });

    it("should reject co_organizer removing another co_organizer", async () => {
        const { organizerAuth, event } = await createOrganizerAndEvent();

        const firstCoOrganizerAuth = await registerAndAuthenticateUser({
            name: "First Co Organizer",
            email: `coorg1${Date.now()}@test.com`
        });

        const secondCoOrganizerAuth = await registerAndAuthenticateUser({
            name: "Second Co Organizer",
            email: `coorg2${Date.now()}@test.com`
        });

        const firstCoOrganizerId = await findUserIdByEmail(firstCoOrganizerAuth.email);
        const secondCoOrganizerId = await findUserIdByEmail(secondCoOrganizerAuth.email);

        await joinEventAsAuthenticatedUser(event.id, firstCoOrganizerAuth.headers);
        await joinEventAsAuthenticatedUser(event.id, secondCoOrganizerAuth.headers);

        await updateEventMemberRole(event.id, firstCoOrganizerId, organizerAuth.headers, EVENT_ROLES.CO_ORGANIZER);
        await updateEventMemberRole(event.id, secondCoOrganizerId, organizerAuth.headers, EVENT_ROLES.CO_ORGANIZER);

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/${secondCoOrganizerId}`)
            .set(firstCoOrganizerAuth.headers);

        expect(res.statusCode).toBe(403);
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    it("should reject invalid eventId", async () => {
        const { organizerAuth } = await createOrganizerAndEvent();

        const res = await request(app)
            .delete("/api/events/abc/members/1")
            .set(organizerAuth.headers);

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid userId", async () => {
        const { organizerAuth } = await createOrganizerAndEvent();

        const res = await request(app)
            .delete("/api/events/1/members/abc")
            .set(organizerAuth.headers);

        expect(res.statusCode).toBe(400);
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    it("should reject removing nonexistent member", async () => {
        const { organizerAuth, event } = await createOrganizerAndEvent();

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/999999`)
            .set(organizerAuth.headers);

        expect(res.statusCode).toBe(404);
    });

    it("should reject removing member from past event", async () => {
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

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/${participantId}`)
            .set(organizerAuth.headers);

        expect(res.statusCode).toBe(403);
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should reject removing member from inaccessible event", async () => {
        const { organizerAuth } = await createOrganizerAndEvent();

        const res = await request(app)
            .delete("/api/events/999999/members/1")
            .set(organizerAuth.headers);

        expect(res.statusCode).toBe(403);
    });
});
