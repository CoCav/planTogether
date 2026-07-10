const { EVENT_ROLES } = require("../../../src/constants/eventRoles");

const {
    initializeTestDatabase,
    resetTestDatabase,
    closeTestDatabase
} = require("../../helpers/database/dbTestHelper");

const { registerAndAuthenticateUser } = require("../../helpers/http/authTestHelper");
const {
    createOrganizer,
    createOrganizerAndEvent,
    deleteEvent,
    getEventById
} = require("../../helpers/http/eventTestHelper");

const {
    joinEventAsAuthenticatedUser,
    updateEventMemberRole
} = require("../../helpers/http/eventMembershipTestHelper");

const { findCoOrganizerId } = require("../../helpers/http/userTestHelper");

/* ==========================================================================
   Events Integration Tests - Delete Event

   Tests event deletion behavior.

   Responsibilities
   - Test successful event deletion
   - Test authentication errors
   - Test authorization errors
   - Test deletion business rules
   - Test validation errors
   - Test inaccessible event handling

   Notes
   - Only organizers can delete events.
   - Deleted events are no longer retrievable.
   - Events that already started cannot be deleted.
=========================================================================== */

describe("Delete Event API", () => {
    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* =============================
       EVENT DELETION SUCCESS
    ============================= */

    describe("Event deletion success", () => {
        it("allows organizer to delete event", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                organizer: {
                    name: "Event Deleter",
                    email: `eventdeleter${Date.now()}@test.com`
                },
                event: {
                    title: "Community Meetup"
                }
            });

            const response = await deleteEvent(event.id, organizerAuth.headers);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty(
                "message",
                "Event deleted successfully"
            );

            const getResponse = await getEventById(event.id);

            expect(getResponse.statusCode).toBe(404);
        });
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    describe("Authentication errors", () => {
        it("rejects delete without token", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "Board Game Night"
                }
            });

            const response = await deleteEvent(event.id);

            expect(response.statusCode).toBe(401);
        });
    });

    /* =============================
       AUTHORIZATION ERRORS
    ============================= */

    describe("Authorization errors", () => {
        it("rejects delete by participant", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "Photography Workshop"
                }
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "Delete Unauthorized Participant",
                email: `deleteunauthorizedparticipant${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

            const response = await deleteEvent(
                event.id,
                participantAuth.headers
            );

            expect(response.statusCode).toBe(403);
        });

        it("rejects delete by co-organizer", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                event: {
                    title: "Tech Meetup"
                }
            });

            const coOrganizerAuth = await registerAndAuthenticateUser({
                name: "Delete Unauthorized Co Organizer",
                email: `deleteunauthorizedcoorganizer${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, coOrganizerAuth.headers);

            const coOrganizerId = await findCoOrganizerId(coOrganizerAuth);

            await updateEventMemberRole(
                event.id,
                coOrganizerId,
                organizerAuth.headers,
                EVENT_ROLES.CO_ORGANIZER
            );

            const response = await deleteEvent(
                event.id,
                coOrganizerAuth.headers
            );

            expect(response.statusCode).toBe(403);
        });

        it("rejects deleting inaccessible event", async () => {
            const organizerAuth = await createOrganizer({
                name: "Missing Event Deleter",
                email: `missingdelete${Date.now()}@test.com`
            });

            const response = await deleteEvent(
                999999,
                organizerAuth.headers
            );

            expect(response.statusCode).toBe(403);
        });
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    describe("Business rules", () => {
        it("rejects deleting event that has already started", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                organizer: {
                    name: "Started Event Deleter",
                    email: `startedeventdeleter${Date.now()}@test.com`
                },
                event: {
                    title: "Started Meetup",
                    startDateTime: "2020-01-01T10:00:00.000Z",
                    endDateTime: "2999-01-01T12:00:00.000Z"
                }
            });

            const response = await deleteEvent(
                event.id,
                organizerAuth.headers
            );

            expect(response.statusCode).toBe(403);
            expect(response.body).toHaveProperty("message", "An event that has already started cannot be deleted");
        });
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    describe("Validation errors", () => {
        it("rejects invalid event identifiers", async () => {
            const organizerAuth = await createOrganizer({
                name: "Invalid ID User",
                email: `invalidid${Date.now()}@test.com`
            });

            const response = await deleteEvent(
                "abc",
                organizerAuth.headers
            );

            expect(response.statusCode).toBe(400);
        });
    });
});
