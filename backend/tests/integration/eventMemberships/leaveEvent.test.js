const { EventUserRole } = require("../../../src/models");

const {
    initializeTestDatabase,
    resetTestDatabase,
    closeTestDatabase
} = require("../../helpers/database/dbTestHelper");

const { registerAndAuthenticateUser } = require("../../helpers/http/authTestHelper");
const { createOrganizerAndEvent } = require("../../helpers/http/eventTestHelper");
const {
    joinEventAsAuthenticatedUser,
    leaveEventAsAuthenticatedUser
} = require("../../helpers/http/eventMembershipTestHelper");

/* ==========================================================================
   Event Membership Integration Tests - Leave Event

   Tests event leave behavior.

   Responsibilities
   - Test successful leave
   - Test authentication errors
   - Test validation errors
   - Test leave business rules
   - Test missing event handling

   Notes
   - Members can leave events.
   - Leaving an event soft-deletes the membership.
   - Organizers cannot leave their own events.
=========================================================================== */

describe("Leave Event API", () => {
    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* =============================
       LEAVE SUCCESS
    ============================= */

    describe("Leave success", () => {
        it("allows a member to leave an event", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "Community Meetup"
                }
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "Leaving Participant",
                email: `leavingparticipant${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

            const response = await leaveEventAsAuthenticatedUser(
                event.id,
                participantAuth.headers
            );

            const membership = await EventUserRole.findOne({
                where: {
                    eventId: event.id,
                    userId: participantAuth.user.userId
                }
            });

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "User successfully left the event");

            expect(membership).not.toBeNull();
            expect(membership.deletedAt).not.toBeNull();
        });
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    describe("Authentication errors", () => {
        it("rejects leaving without token", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "Board Game Night"
                }
            });

            const response = await leaveEventAsAuthenticatedUser(event.id);

            expect(response.statusCode).toBe(401);
        });
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    describe("Validation errors", () => {
        it("rejects invalid event identifiers", async () => {
            const participantAuth = await registerAndAuthenticateUser({
                name: "Invalid Leave Participant",
                email: `invalidleaveparticipant${Date.now()}@test.com`
            });

            const response = await leaveEventAsAuthenticatedUser(
                "abc",
                participantAuth.headers
            );

            expect(response.statusCode).toBe(400);
        });
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    describe("Business rules", () => {
        it("rejects leaving an event without being a member", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "Coffee Meetup"
                }
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "Non Member Participant",
                email: `nonmemberparticipant${Date.now()}@test.com`
            });

            const response = await leaveEventAsAuthenticatedUser(
                event.id,
                participantAuth.headers
            );

            expect(response.statusCode).toBe(404);
        });

        it("rejects organizer leaving own event", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                event: {
                    title: "Tech Meetup"
                }
            });

            const response = await leaveEventAsAuthenticatedUser(
                event.id,
                organizerAuth.headers
            );

            expect(response.statusCode).toBe(403);
        });

        it("rejects leaving a past event", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "Past Meetup",
                    startDateTime: "2020-01-01T10:00:00.000Z",
                    endDateTime: "2020-01-01T12:00:00.000Z"
                }
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "Past Leave Participant",
                email: `pastleaveparticipant${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

            const response = await leaveEventAsAuthenticatedUser(
                event.id,
                participantAuth.headers
            );

            expect(response.statusCode).toBe(403);
        });
    });

    /* =============================
       NOT FOUND
    ============================= */

    describe("Not found", () => {
        it("returns 404 when the event does not exist", async () => {
            const participantAuth = await registerAndAuthenticateUser({
                name: "Missing Leave Participant",
                email: `missingleaveparticipant${Date.now()}@test.com`
            });

            const response = await leaveEventAsAuthenticatedUser(
                999999,
                participantAuth.headers
            );

            expect(response.statusCode).toBe(404);
        });
    });
});
