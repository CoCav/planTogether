/* ==============================================================
   EVENT MEMBERSHIP INTEGRATION - TRANSFER EVENT OWNERSHIP TESTS

   Tests:
   - ownership transfer to participant
   - ownership transfer to co_organizer
   - previous organizer role update
   - organizer-only authorization
   - authentication protection
   - non-member ownership rejection
   - inactive ownership transfer rejection
   - self-transfer rejection
   - invalid params validation

   Ensures:
   - only organizers can transfer event ownership
   - selected members can become organizer
   - previous organizer becomes co_organizer
   - inactive memberships cannot receive ownership transfer
   - ownership transfer rules are enforced correctly
   - shared event role constants are used for valid role scenarios
============================================================= */

const request = require("supertest");
const app = require("../../../src/app");

const { EventUserRole } = require("../../../src/models");

const { EVENT_ROLES } = require("../../../src/constants/eventRoles");

const { initDB, resetDB, closeDB } = require("../../helpers/database/dbTestHelper");

const { registerAndGetToken } = require("../../helpers/api/authHelper");
const { createEventWithOrganizer } = require("../../helpers/api/eventHelper");
const { joinEvent, updateMemberRole, transferEventOwnership } = require("../../helpers/api/eventMembershipHelper");
const { getUserIdByEmail } = require("../../helpers/api/userHelper");

describe("Transfer Event Ownership API", () => {

    beforeAll(initDB);
    afterEach(resetDB);
    afterAll(closeDB);

    /* =============================
       OWNERSHIP TRANSFER SUCCESS
    ============================= */

    it("should allow organizer to transfer ownership to participant", async () => {
        const { organizerAuth, event } = await createEventWithOrganizer();

        const participantAuth = await registerAndGetToken({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        const organizerId = await getUserIdByEmail(organizerAuth.email);
        const participantId = await getUserIdByEmail(participantAuth.email);

        await joinEvent(event.id, participantAuth.headers);

        const res = await transferEventOwnership(event.id, participantId, organizerAuth.headers);

        const previousOrganizerMembership = await EventUserRole.findOne({
            where: {
                eventId: event.id,
                userId: organizerId
            }
        });

        const newOrganizerMembership = await EventUserRole.findOne({
            where: {
                eventId: event.id,
                userId: participantId
            }
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Event ownership transferred successfully");

        expect(previousOrganizerMembership.role).toBe(EVENT_ROLES.CO_ORGANIZER);
        expect(newOrganizerMembership.role).toBe(EVENT_ROLES.ORGANIZER);
    });

    it("should allow organizer to transfer ownership to co_organizer", async () => {
        const { organizerAuth, event } = await createEventWithOrganizer();

        const coOrganizerAuth = await registerAndGetToken({
            name: "Co Organizer",
            email: `coorg${Date.now()}@test.com`
        });

        const organizerId = await getUserIdByEmail(organizerAuth.email);
        const coOrganizerId = await getUserIdByEmail(coOrganizerAuth.email);

        await joinEvent(event.id, coOrganizerAuth.headers);

        await updateMemberRole(event.id, coOrganizerId, organizerAuth.headers, EVENT_ROLES.CO_ORGANIZER);

        const res = await transferEventOwnership(event.id, coOrganizerId, organizerAuth.headers);

        const previousOrganizerMembership = await EventUserRole.findOne({
            where: {
                eventId: event.id,
                userId: organizerId
            }
        });

        const newOrganizerMembership = await EventUserRole.findOne({
            where: {
                eventId: event.id,
                userId: coOrganizerId
            }
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Event ownership transferred successfully");

        expect(previousOrganizerMembership.role).toBe(EVENT_ROLES.CO_ORGANIZER);
        expect(newOrganizerMembership.role).toBe(EVENT_ROLES.ORGANIZER);
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    it("should reject ownership transfer without token", async () => {
        const { event } = await createEventWithOrganizer();

        const res = await request(app)
            .put(`/api/events/${event.id}/ownership`)
            .send({
                targetUserId: 1
            });

        expect(res.statusCode).toBe(401);
    });

    /* =============================
       AUTHORIZATION ERRORS
    ============================= */

    it("should reject ownership transfer by co_organizer", async () => {
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

        await updateMemberRole(
            event.id,
            coOrganizerId,
            organizerAuth.headers,
            EVENT_ROLES.CO_ORGANIZER
        );

        const res = await transferEventOwnership(
            event.id,
            participantId,
            coOrganizerAuth.headers
        );

        expect(res.statusCode).toBe(403);
    });

    it("should reject ownership transfer by participant", async () => {
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

        const res = await transferEventOwnership(
            event.id,
            targetParticipantId,
            participantAuth.headers
        );

        expect(res.statusCode).toBe(403);
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    it("should reject missing targetUserId", async () => {
        const { organizerAuth, event } = await createEventWithOrganizer();

        const res = await request(app)
            .put(`/api/events/${event.id}/ownership`)
            .set(organizerAuth.headers)
            .send({});

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid targetUserId", async () => {
        const { organizerAuth, event } = await createEventWithOrganizer();

        const res = await request(app)
            .put(`/api/events/${event.id}/ownership`)
            .set(organizerAuth.headers)
            .send({
                targetUserId: "abc"
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid eventId", async () => {
        const { organizerAuth } = await createEventWithOrganizer();

        const res = await request(app)
            .put("/api/events/abc/ownership")
            .set(organizerAuth.headers)
            .send({
                targetUserId: 1
            });

        expect(res.statusCode).toBe(400);
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    it("should reject ownership transfer to self", async () => {
        const { organizerAuth, event } = await createEventWithOrganizer();

        const organizerId = await getUserIdByEmail(organizerAuth.email);

        const res = await transferEventOwnership(event.id, organizerId, organizerAuth.headers);

        expect(res.statusCode).toBe(400);
    });

    it("should reject ownership transfer to non-member", async () => {
        const { organizerAuth, event } = await createEventWithOrganizer();

        const outsiderAuth = await registerAndGetToken({
            name: "Outsider",
            email: `outsider${Date.now()}@test.com`
        });

        const outsiderId = await getUserIdByEmail(outsiderAuth.email);

        const res = await transferEventOwnership(event.id, outsiderId, organizerAuth.headers);

        expect(res.statusCode).toBe(404);
    });

    it("should reject ownership transfer for past event", async () => {
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

        const res = await transferEventOwnership(event.id, participantId, organizerAuth.headers);

        expect(res.statusCode).toBe(403);
    });

    it("should reject ownership transfer to inactive member", async () => {
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

        const res = await transferEventOwnership(event.id, participantId, organizerAuth.headers);

        expect(res.statusCode).toBe(404);
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should reject ownership transfer for nonexistent event", async () => {
        const organizerAuth = await registerAndGetToken({
            name: "Organizer",
            email: `organizer${Date.now()}@test.com`
        });

        const res = await transferEventOwnership(999999, 1, organizerAuth.headers);

        expect(res.statusCode).toBe(403);
    });
});
