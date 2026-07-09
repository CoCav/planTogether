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
    updateEventMemberRole,
    transferEventOwnership
} = require("../../helpers/http/eventMembershipTestHelper");

const {
    findOrganizerId,
    findParticipantId,
    findCoOrganizerId,
    findUserIdByEmail
} = require("../../helpers/http/userTestHelper");

/* ==========================================================================
   Event Membership Integration Tests - Transfer Event Ownership

   Tests event ownership transfer behavior.

   Responsibilities
   - Test successful ownership transfers
   - Test authentication errors
   - Test authorization errors
   - Test validation errors
   - Test ownership transfer business rules
   - Test missing event handling

   Notes
   - Only organizers can transfer event ownership.
   - The new organizer must be an active event member.
   - The previous organizer becomes co-organizer after transfer.
=========================================================================== */

describe("Transfer Event Ownership API", () => {
    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* =============================
       TRANSFER SUCCESS
    ============================= */

    describe("Transfer success", () => {
        it("allows organizer to transfer ownership to participant", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                event: {
                    title: "Community Meetup"
                }
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "New Organizer Participant",
                email: `neworganizerparticipant${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

            const organizerId = await findOrganizerId(organizerAuth);
            const participantId = await findParticipantId(participantAuth);

            const response = await transferEventOwnership(
                event.id,
                participantId,
                organizerAuth.headers
            );

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

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "Event ownership transferred successfully");

            expect(previousOrganizerMembership.role).toBe(EVENT_ROLES.CO_ORGANIZER);
            expect(newOrganizerMembership.role).toBe(EVENT_ROLES.ORGANIZER);
        });

        it("allows organizer to transfer ownership to co-organizer", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                event: {
                    title: "Board Game Night"
                }
            });

            const coOrganizerAuth = await registerAndAuthenticateUser({
                name: "New Organizer Co Organizer",
                email: `neworganizercoorganizer${Date.now()}@test.com`
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

            const response = await transferEventOwnership(
                event.id,
                coOrganizerId,
                organizerAuth.headers
            );

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

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "Event ownership transferred successfully");

            expect(previousOrganizerMembership.role).toBe(EVENT_ROLES.CO_ORGANIZER);
            expect(newOrganizerMembership.role).toBe(EVENT_ROLES.ORGANIZER);
        });
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    describe("Authentication errors", () => {
        it("rejects ownership transfer without token", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "Coffee Meetup"
                }
            });

            const response = await transferEventOwnership(event.id, 1);

            expect(response.statusCode).toBe(401);
        });
    });

    /* =============================
       AUTHORIZATION ERRORS
    ============================= */

    describe("Authorization errors", () => {
        it("rejects ownership transfer by co-organizer", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                event: {
                    title: "Photography Workshop"
                }
            });

            const coOrganizerAuth = await registerAndAuthenticateUser({
                name: "Unauthorized Co Organizer",
                email: `unauthorizedcoorganizer${Date.now()}@test.com`
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "Ownership Target Participant",
                email: `ownershiptargetparticipant${Date.now()}@test.com`
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

            const response = await transferEventOwnership(
                event.id,
                participantId,
                coOrganizerAuth.headers
            );

            expect(response.statusCode).toBe(403);
        });

        it("rejects ownership transfer by participant", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "Tech Meetup"
                }
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "Unauthorized Ownership Participant",
                email: `unauthorizedownershipparticipant${Date.now()}@test.com`
            });

            const targetParticipantAuth = await registerAndAuthenticateUser({
                name: "Target Ownership Participant",
                email: `targetownershipparticipant${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);
            await joinEventAsAuthenticatedUser(event.id, targetParticipantAuth.headers);

            const targetParticipantId = await findParticipantId(targetParticipantAuth);

            const response = await transferEventOwnership(
                event.id,
                targetParticipantId,
                participantAuth.headers
            );

            expect(response.statusCode).toBe(403);
        });
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    describe("Validation errors", () => {
        it("rejects missing targetUserId", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent();

            const response = await transferEventOwnership(
                event.id,
                undefined,
                organizerAuth.headers
            );

            expect(response.statusCode).toBe(400);
        });

        it("rejects invalid targetUserId", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent();

            const response = await transferEventOwnership(
                event.id,
                "abc",
                organizerAuth.headers
            );

            expect(response.statusCode).toBe(400);
        });

        it("rejects invalid event identifiers", async () => {
            const { organizerAuth } = await createOrganizerAndEvent();

            const response = await transferEventOwnership(
                "abc",
                1,
                organizerAuth.headers
            );

            expect(response.statusCode).toBe(400);
        });
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    describe("Business rules", () => {
        it("rejects ownership transfer to self", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                event: {
                    title: "Self Transfer Meetup"
                }
            });

            const organizerId = await findOrganizerId(organizerAuth);

            const response = await transferEventOwnership(
                event.id,
                organizerId,
                organizerAuth.headers
            );

            expect(response.statusCode).toBe(400);
        });

        it("rejects ownership transfer to non-member", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                event: {
                    title: "Members Only Meetup"
                }
            });

            const outsiderAuth = await registerAndAuthenticateUser({
                name: "Ownership Outsider",
                email: `ownershipoutsider${Date.now()}@test.com`
            });

            const outsiderId = await findUserIdByEmail(outsiderAuth.email);

            const response = await transferEventOwnership(
                event.id,
                outsiderId,
                organizerAuth.headers
            );

            expect(response.statusCode).toBe(404);
        });

        it("rejects ownership transfer for past event", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                event: {
                    title: "Past Meetup",
                    startDateTime: "2020-01-01T10:00:00.000Z",
                    endDateTime: "2020-01-01T12:00:00.000Z"
                }
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "Past Ownership Participant",
                email: `pastownershipparticipant${Date.now()}@test.com`
            });

            const participantId = await findParticipantId(participantAuth);

            await EventUserRole.create({
                eventId: event.id,
                userId: participantId,
                role: EVENT_ROLES.PARTICIPANT
            });

            const response = await transferEventOwnership(
                event.id,
                participantId,
                organizerAuth.headers
            );

            expect(response.statusCode).toBe(403);
        });

        it("rejects ownership transfer to inactive member", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                event: {
                    title: "Inactive Member Meetup"
                }
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "Inactive Ownership Participant",
                email: `inactiveownershipparticipant${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);
            await leaveEventAsAuthenticatedUser(event.id, participantAuth.headers);

            const participantId = await findParticipantId(participantAuth);

            const response = await transferEventOwnership(
                event.id,
                participantId,
                organizerAuth.headers
            );

            expect(response.statusCode).toBe(404);
        });
    });

    /* =============================
       NOT FOUND
    ============================= */

    describe("Not found", () => {
        it("returns 403 when the event does not exist", async () => {
            const organizerAuth = await registerAndAuthenticateUser({
                name: "Missing Ownership Organizer",
                email: `missingownershiporganizer${Date.now()}@test.com`
            });

            const response = await transferEventOwnership(
                999999,
                1,
                organizerAuth.headers
            );

            expect(response.statusCode).toBe(403);
        });
    });
});
