const { EventUserRole } = require("../../../src/models");

const { EVENT_ROLES } = require("../../../src/constants/eventRoles");

const {
    initializeTestDatabase,
    resetTestDatabase,
    closeTestDatabase
} = require("../../helpers/database/dbTestHelper");

const { registerAndAuthenticateUser } = require("../../helpers/http/authTestHelper");
const { createOrganizerAndEvent } = require("../../helpers/http/eventTestHelper");
const {
    joinEventAsAuthenticatedUser,
    leaveEventAsAuthenticatedUser,
    updateEventMemberRole
} = require("../../helpers/http/eventMembershipTestHelper");

const {
    findOrganizerId,
    findParticipantId,
    findCoOrganizerId
} = require("../../helpers/http/userTestHelper");

/* ==========================================================================
   Event Membership Integration Tests - Update Event Member Role

   Tests event member role update behavior.

   Responsibilities
   - Test successful role updates
   - Test authorization errors
   - Test validation errors
   - Test role update business rules
   - Test missing member handling

   Notes
   - Only organizers can update member roles.
   - Event creator role cannot be changed.
   - Inactive memberships cannot be updated.
=========================================================================== */

describe("Update Event Member Role API", () => {
    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* =============================
       ROLE UPDATE SUCCESS
    ============================= */

    describe("Role update success", () => {
        it("allows organizer to promote participant to co-organizer", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                event: {
                    title: "Community Meetup"
                }
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "Promoted Participant",
                email: `promotedparticipant${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

            const participantId = await findParticipantId(participantAuth);

            const response = await updateEventMemberRole(
                event.id,
                participantId,
                organizerAuth.headers,
                EVENT_ROLES.CO_ORGANIZER
            );

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "Event member role updated successfully");
            expect(response.body.membership.role).toBe(EVENT_ROLES.CO_ORGANIZER);
        });

        it("allows organizer to demote co-organizer to participant", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                event: {
                    title: "Board Game Night"
                }
            });

            const coOrganizerAuth = await registerAndAuthenticateUser({
                name: "Demoted Co Organizer",
                email: `demotedcoorganizer${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, coOrganizerAuth.headers);

            const coOrganizerId = await findCoOrganizerId(coOrganizerAuth);

            await updateEventMemberRole(
                event.id,
                coOrganizerId,
                organizerAuth.headers,
                EVENT_ROLES.CO_ORGANIZER
            );

            const response = await updateEventMemberRole(
                event.id,
                coOrganizerId,
                organizerAuth.headers,
                EVENT_ROLES.PARTICIPANT
            );

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "Event member role updated successfully");
            expect(response.body.membership.role).toBe(EVENT_ROLES.PARTICIPANT);
        });
    });

    /* =============================
       AUTHORIZATION ERRORS
    ============================= */

    describe("Authorization errors", () => {
        it("rejects role update by co-organizer", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                event: {
                    title: "Photography Workshop"
                }
            });

            const coOrganizerAuth = await registerAndAuthenticateUser({
                name: "Unauthorized Co Organizer",
                email: `unauthorizedcoorganizerrole${Date.now()}@test.com`
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "Role Target Participant",
                email: `roletargetparticipant${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, coOrganizerAuth.headers);
            await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

            const coOrganizerId = await findCoOrganizerId(coOrganizerAuth);
            const participantId = await findParticipantId(participantAuth);

            await updateEventMemberRole(
                event.id,
                coOrganizerId,
                organizerAuth.headers,
                EVENT_ROLES.CO_ORGANIZER
            );

            const response = await updateEventMemberRole(
                event.id,
                participantId,
                coOrganizerAuth.headers,
                EVENT_ROLES.CO_ORGANIZER
            );

            expect(response.statusCode).toBe(403);
        });

        it("rejects role update by participant", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "Coffee Meetup"
                }
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "Unauthorized Role Participant",
                email: `unauthorizedroleparticipant${Date.now()}@test.com`
            });

            const targetParticipantAuth = await registerAndAuthenticateUser({
                name: "Target Role Participant",
                email: `targetroleparticipant${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);
            await joinEventAsAuthenticatedUser(event.id, targetParticipantAuth.headers);

            const targetParticipantId = await findParticipantId(targetParticipantAuth);

            const response = await updateEventMemberRole(
                event.id,
                targetParticipantId,
                participantAuth.headers,
                EVENT_ROLES.CO_ORGANIZER
            );

            expect(response.statusCode).toBe(403);
        });

        it("rejects changing event creator role", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                event: {
                    title: "Creator Protected Meetup"
                }
            });

            const organizerId = await findOrganizerId(organizerAuth);

            const response = await updateEventMemberRole(
                event.id,
                organizerId,
                organizerAuth.headers,
                EVENT_ROLES.PARTICIPANT
            );

            expect(response.statusCode).toBe(403);
        });
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    describe("Validation errors", () => {
        it("rejects missing newRole", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                event: {
                    title: "Missing Role Meetup"
                }
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "Missing Role Participant",
                email: `missingroleparticipant${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

            const participantId = await findParticipantId(participantAuth);

            const response = await updateEventMemberRole(
                event.id,
                participantId,
                organizerAuth.headers,
                undefined
            );

            expect(response.statusCode).toBe(400);
        });

        it("rejects invalid newRole", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                event: {
                    title: "Invalid Role Meetup"
                }
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "Invalid Role Participant",
                email: `invalidroleparticipant${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

            const participantId = await findParticipantId(participantAuth);

            const response = await updateEventMemberRole(
                event.id,
                participantId,
                organizerAuth.headers,
                "admin"
            );

            expect(response.statusCode).toBe(400);
        });

        it("rejects invalid event identifiers", async () => {
            const { organizerAuth } = await createOrganizerAndEvent();

            const response = await updateEventMemberRole(
                "abc",
                1,
                organizerAuth.headers,
                EVENT_ROLES.PARTICIPANT
            );

            expect(response.statusCode).toBe(400);
        });

        it("rejects invalid user identifiers", async () => {
            const { organizerAuth } = await createOrganizerAndEvent();

            const response = await updateEventMemberRole(
                1,
                "abc",
                organizerAuth.headers,
                EVENT_ROLES.PARTICIPANT
            );

            expect(response.statusCode).toBe(400);
        });
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    describe("Business rules", () => {
        it("rejects updating member to same role", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                event: {
                    title: "Same Role Meetup"
                }
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "Same Role Participant",
                email: `sameroleparticipant${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

            const participantId = await findParticipantId(participantAuth);

            const response = await updateEventMemberRole(
                event.id,
                participantId,
                organizerAuth.headers,
                EVENT_ROLES.PARTICIPANT
            );

            expect(response.statusCode).toBe(400);
        });

        it("rejects updating role for past event", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                event: {
                    title: "Past Meetup",
                    startDateTime: "2020-01-01T10:00:00.000Z",
                    endDateTime: "2020-01-01T12:00:00.000Z"
                }
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "Past Role Participant",
                email: `pastroleparticipant${Date.now()}@test.com`
            });

            const participantId = await findParticipantId(participantAuth);

            await EventUserRole.create({
                eventId: event.id,
                userId: participantId,
                role: EVENT_ROLES.PARTICIPANT
            });

            const response = await updateEventMemberRole(
                event.id,
                participantId,
                organizerAuth.headers,
                EVENT_ROLES.CO_ORGANIZER
            );

            expect(response.statusCode).toBe(403);
        });

        it("rejects updating role for inactive membership", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                event: {
                    title: "Inactive Role Meetup"
                }
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "Inactive Role Participant",
                email: `inactiveroleparticipant${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);
            await leaveEventAsAuthenticatedUser(event.id, participantAuth.headers);

            const participantId = await findParticipantId(participantAuth);

            const response = await updateEventMemberRole(
                event.id,
                participantId,
                organizerAuth.headers,
                EVENT_ROLES.CO_ORGANIZER
            );

            expect(response.statusCode).toBe(404);
        });
    });

    /* =============================
       NOT FOUND
    ============================= */

    describe("Not found", () => {
        it("returns 404 when the member does not exist", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                event: {
                    title: "Missing Member Meetup"
                }
            });

            const response = await updateEventMemberRole(
                event.id,
                999999,
                organizerAuth.headers,
                EVENT_ROLES.PARTICIPANT
            );

            expect(response.statusCode).toBe(404);
        });
    });
});
