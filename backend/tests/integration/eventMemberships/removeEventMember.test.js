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
    updateEventMemberRole,
    removeEventMember
} = require("../../helpers/http/eventMembershipTestHelper");

const {
    findParticipantId,
    findOrganizerId,
    findCoOrganizerId
} = require("../../helpers/http/userTestHelper");

/* ==========================================================================
   Event Membership Integration Tests - Remove Event Member

   Tests event member removal behavior.

   Responsibilities
   - Test successful member removals
   - Test authentication errors
   - Test authorization errors
   - Test validation errors
   - Test removal business rules
   - Test missing member handling

   Notes
   - Organizers and co-organizers can remove participants.
   - Removed memberships are soft-deleted.
   - Protected memberships cannot be removed.
=========================================================================== */

describe("Remove Event Member API", () => {
    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* =============================
       REMOVE MEMBER SUCCESS
    ============================= */

    describe("Remove member success", () => {
        it("allows organizer to remove participant", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                event: {
                    title: "Community Meetup"
                }
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "Removed Participant",
                email: `removedparticipant${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

            const participantId = await findParticipantId(participantAuth);

            const response = await removeEventMember(
                event.id,
                participantId,
                organizerAuth.headers
            );

            const membership = await EventUserRole.findOne({
                where: {
                    eventId: event.id,
                    userId: participantId
                }
            });

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "Event member removed successfully");

            expect(membership).not.toBeNull();
            expect(membership.deletedAt).not.toBeNull();
        });

        it("allows co-organizer to remove participant", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                event: {
                    title: "Board Game Night"
                }
            });

            const coOrganizerAuth = await registerAndAuthenticateUser({
                name: "Removing Co Organizer",
                email: `removingcoorganizer${Date.now()}@test.com`
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "Co Organizer Removed Participant",
                email: `coorganizerremovedparticipant${Date.now()}@test.com`
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

            const response = await removeEventMember(
                event.id,
                participantId,
                coOrganizerAuth.headers
            );

            const membership = await EventUserRole.findOne({
                where: {
                    eventId: event.id,
                    userId: participantId
                }
            });

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "Event member removed successfully");

            expect(membership).not.toBeNull();
            expect(membership.deletedAt).not.toBeNull();
        });
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    describe("Authentication errors", () => {
        it("rejects removal without token", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "Coffee Meetup"
                }
            });

            const response = await removeEventMember(event.id, 1);

            expect(response.statusCode).toBe(401);
        });
    });

    /* =============================
       AUTHORIZATION ERRORS
    ============================= */

    describe("Authorization errors", () => {
        it("rejects removal by participant", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "Photography Workshop"
                }
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "Unauthorized Participant",
                email: `unauthorizedparticipant${Date.now()}@test.com`
            });

            const targetParticipantAuth = await registerAndAuthenticateUser({
                name: "Unauthorized Target Participant",
                email: `unauthorizedtargetparticipant${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);
            await joinEventAsAuthenticatedUser(event.id, targetParticipantAuth.headers);

            const targetParticipantId = await findParticipantId(targetParticipantAuth);

            const response = await removeEventMember(
                event.id,
                targetParticipantId,
                participantAuth.headers
            );

            expect(response.statusCode).toBe(403);
        });

        it("rejects organizer removing themselves", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                event: {
                    title: "Organizer Meetup"
                }
            });

            const organizerId = await findOrganizerId(organizerAuth);

            const response = await removeEventMember(
                event.id,
                organizerId,
                organizerAuth.headers
            );

            expect(response.statusCode).toBe(403);
        });

        it("rejects removing event creator", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                event: {
                    title: "Creator Protected Meetup"
                }
            });

            const coOrganizerAuth = await registerAndAuthenticateUser({
                name: "Creator Removal Co Organizer",
                email: `creatorremovalcoorganizer${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, coOrganizerAuth.headers);

            const organizerId = await findOrganizerId(organizerAuth);
            const coOrganizerId = await findCoOrganizerId(coOrganizerAuth);

            await updateEventMemberRole(
                event.id,
                coOrganizerId,
                organizerAuth.headers,
                EVENT_ROLES.CO_ORGANIZER
            );

            const response = await removeEventMember(
                event.id,
                organizerId,
                coOrganizerAuth.headers
            );

            expect(response.statusCode).toBe(403);
        });

        it("rejects co-organizer removing another co-organizer", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                event: {
                    title: "Co Organizer Meetup"
                }
            });

            const firstCoOrganizerAuth = await registerAndAuthenticateUser({
                name: "First Co Organizer",
                email: `firstcoorganizer${Date.now()}@test.com`
            });

            const secondCoOrganizerAuth = await registerAndAuthenticateUser({
                name: "Second Co Organizer",
                email: `secondcoorganizer${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, firstCoOrganizerAuth.headers);
            await joinEventAsAuthenticatedUser(event.id, secondCoOrganizerAuth.headers);

            const firstCoOrganizerId = await findCoOrganizerId(firstCoOrganizerAuth);
            const secondCoOrganizerId = await findCoOrganizerId(secondCoOrganizerAuth);

            await updateEventMemberRole(
                event.id,
                firstCoOrganizerId,
                organizerAuth.headers,
                EVENT_ROLES.CO_ORGANIZER
            );

            await updateEventMemberRole(
                event.id,
                secondCoOrganizerId,
                organizerAuth.headers,
                EVENT_ROLES.CO_ORGANIZER
            );

            const response = await removeEventMember(
                event.id,
                secondCoOrganizerId,
                firstCoOrganizerAuth.headers
            );

            expect(response.statusCode).toBe(403);
        });

        it("rejects removal from inaccessible event", async () => {
            const { organizerAuth } = await createOrganizerAndEvent({
                event: {
                    title: "Private Meetup"
                }
            });

            const response = await removeEventMember(
                999999,
                1,
                organizerAuth.headers
            );

            expect(response.statusCode).toBe(403);
        });
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    describe("Validation errors", () => {
        it("rejects invalid event identifiers", async () => {
            const { organizerAuth } = await createOrganizerAndEvent();

            const response = await removeEventMember(
                "abc",
                1,
                organizerAuth.headers
            );

            expect(response.statusCode).toBe(400);
        });

        it("rejects invalid user identifiers", async () => {
            const { organizerAuth } = await createOrganizerAndEvent();

            const response = await removeEventMember(
                1,
                "abc",
                organizerAuth.headers
            );

            expect(response.statusCode).toBe(400);
        });
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    describe("Business rules", () => {
        it("rejects removing member from past event", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                event: {
                    title: "Past Meetup",
                    startDateTime: "2020-01-01T10:00:00.000Z",
                    endDateTime: "2020-01-01T12:00:00.000Z"
                }
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "Past Event Participant",
                email: `pasteventparticipant${Date.now()}@test.com`
            });

            const participantId = await findParticipantId(participantAuth);

            await EventUserRole.create({
                eventId: event.id,
                userId: participantId,
                role: EVENT_ROLES.PARTICIPANT
            });

            const response = await removeEventMember(
                event.id,
                participantId,
                organizerAuth.headers
            );

            expect(response.statusCode).toBe(403);
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

            const response = await removeEventMember(
                event.id,
                999999,
                organizerAuth.headers
            );

            expect(response.statusCode).toBe(404);
        });
    });
});
