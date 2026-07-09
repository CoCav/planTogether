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
   Event Membership Integration Tests - Join Event

   Tests event join behavior.

   Responsibilities
   - Test successful joins
   - Test authentication errors
   - Test validation errors
   - Test join business rules
   - Test missing event handling

   Notes
   - Authenticated users can join events.
   - Duplicate active memberships are rejected.
   - Inactive memberships can be restored by rejoining.
=========================================================================== */

describe("Join Event API", () => {
    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* =============================
       JOIN SUCCESS
    ============================= */

    describe("Join success", () => {
        it("allows an authenticated user to join an event", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "Community Meetup"
                }
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "Joining Participant",
                email: `joiningparticipant${Date.now()}@test.com`
            });

            const response = await joinEventAsAuthenticatedUser(
                event.id,
                participantAuth.headers
            );

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "User successfully joined the event");
        });
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    describe("Authentication errors", () => {
        it("rejects joining without token", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "Board Game Night"
                }
            });

            const response = await joinEventAsAuthenticatedUser(event.id);

            expect(response.statusCode).toBe(401);
        });
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    describe("Validation errors", () => {
        it("rejects invalid event identifiers", async () => {
            const participantAuth = await registerAndAuthenticateUser({
                name: "Invalid Join Participant",
                email: `invalidjoinparticipant${Date.now()}@test.com`
            });

            const response = await joinEventAsAuthenticatedUser(
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
        it("rejects joining the same event twice", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "Coffee Meetup"
                }
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "Duplicate Join Participant",
                email: `duplicatejoinparticipant${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

            const response = await joinEventAsAuthenticatedUser(
                event.id,
                participantAuth.headers
            );

            expect(response.statusCode).toBe(409);
        });

        it("rejects joining a past event", async () => {
            const { event } = await createOrganizerAndEvent({
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

            const response = await joinEventAsAuthenticatedUser(
                event.id,
                participantAuth.headers
            );

            expect(response.statusCode).toBe(403);
        });

        it("rejects joining after registration deadline", async () => {
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
            const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "Registration Closed Meetup",
                    registrationDeadline: yesterday,
                    startDateTime: tomorrow,
                    endDateTime: nextWeek
                }
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "Late Join Participant",
                email: `latejoinparticipant${Date.now()}@test.com`
            });

            const response = await joinEventAsAuthenticatedUser(
                event.id,
                participantAuth.headers
            );

            expect(response.statusCode).toBe(409);
        });

        it("rejects joining when event is full", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "Small Workshop",
                    maxParticipants: 1
                }
            });

            const firstParticipantAuth = await registerAndAuthenticateUser({
                name: "First Full Event Participant",
                email: `firstfulleventparticipant${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, firstParticipantAuth.headers);

            const secondParticipantAuth = await registerAndAuthenticateUser({
                name: "Second Full Event Participant",
                email: `secondfulleventparticipant${Date.now()}@test.com`
            });

            const response = await joinEventAsAuthenticatedUser(
                event.id,
                secondParticipantAuth.headers
            );

            expect(response.statusCode).toBe(409);
        });

        it("restores inactive membership when user rejoins event", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "Returning Members Meetup"
                }
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "Returning Participant",
                email: `returningparticipant${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);
            await leaveEventAsAuthenticatedUser(event.id, participantAuth.headers);

            const response = await joinEventAsAuthenticatedUser(
                event.id,
                participantAuth.headers
            );

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "User successfully joined the event");
        });

        it("allows joining when inactive memberships exist", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "Limited Seats Meetup",
                    maxParticipants: 1
                }
            });

            const firstParticipantAuth = await registerAndAuthenticateUser({
                name: "Inactive Seat Participant",
                email: `inactiveseatparticipant${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, firstParticipantAuth.headers);
            await leaveEventAsAuthenticatedUser(event.id, firstParticipantAuth.headers);

            const secondParticipantAuth = await registerAndAuthenticateUser({
                name: "New Seat Participant",
                email: `newseatparticipant${Date.now()}@test.com`
            });

            const response = await joinEventAsAuthenticatedUser(
                event.id,
                secondParticipantAuth.headers
            );

            expect(response.statusCode).toBe(200);
        });
    });

    /* =============================
       NOT FOUND
    ============================= */

    describe("Not found", () => {
        it("returns 404 when the event does not exist", async () => {
            const participantAuth = await registerAndAuthenticateUser({
                name: "Missing Join Participant",
                email: `missingjoinparticipant${Date.now()}@test.com`
            });

            const response = await joinEventAsAuthenticatedUser(
                999999,
                participantAuth.headers
            );

            expect(response.statusCode).toBe(404);
        });
    });
});
