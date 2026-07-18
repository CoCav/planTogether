const { EventUserRole, EventLike } = require("../../../../src/models");

const { EVENT_ROLES } = require("../../../../src/constants/eventRoles");
const { EVENT_STATUS } = require("../../../../src/constants/eventStatus");

const {
    initializeTestDatabase,
    resetTestDatabase,
    closeTestDatabase
} = require("../../../helpers/database/dbTestHelper");

const { registerAndAuthenticateUser } = require("../../../helpers/http/authTestHelper");
const {
    createOrganizer,
    createOrganizerAndEvent,
    createPastOrganizerAndEvent,
    createEventAsAuthenticatedUser,
    createEventWithImage
} = require("../../../helpers/http/eventTestHelper");

const {
    joinEventAsAuthenticatedUser,
    leaveEventAsAuthenticatedUser
} = require("../../../helpers/http/eventMembershipTestHelper");

const { getCurrentUserEvents } = require("../../../helpers/http/userTestHelper");

/* ==========================================================================
   Users Integration Tests - Get Current User Events

   Tests current user event retrieval behavior.

   Responsibilities
   - Test authenticated current user events retrieval
   - Test event metadata enrichment
   - Test pagination and view filters
   - Test inactive membership exclusion
   - Test validation errors

   Notes
   - Current user events include created and joined events.
   - Inactive memberships are excluded.
   - Event metadata includes status, image, participant count and likes.
=========================================================================== */

describe("Get Current User Events API", () => {
    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* =============================
       CURRENT USER EVENTS SUCCESS
    ============================= */

    describe("Current user events success", () => {
        it("retrieves events for the authenticated user", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "User Events Test"
                }
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "Current Events Participant",
                email: `currenteventsparticipant${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

            const response = await getCurrentUserEvents({
                headers: participantAuth.headers
            });

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "User events retrieved successfully");

            expect(Array.isArray(response.body.events)).toBe(true);
            expect(response.body.events.length).toBeGreaterThan(0);
        });
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    describe("Authentication errors", () => {
        it("rejects current user events retrieval without authentication", async () => {
            const response = await getCurrentUserEvents();

            expect(response.statusCode).toBe(401);
        });
    });

    /* =============================
       EVENT METADATA
    ============================= */

    describe("Event metadata", () => {
        it("includes event status in current user events", async () => {
            const { organizerAuth, event } = await createPastOrganizerAndEvent({
                event: {
                    title: "Past Status Event"
                }
            });

            const response = await getCurrentUserEvents({
                headers: organizerAuth.headers
            });

            expect(response.statusCode).toBe(200);

            const eventMembership = response.body.events.find(
                (item) => item.event.id === event.id
            );

            expect(eventMembership).toBeDefined();
            expect(eventMembership.event).toHaveProperty("status", EVENT_STATUS.PAST);
        });

        it("includes participant count and status in user events", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                event: {
                    title: "Count Event"
                }
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "Count Participant",
                email: `countparticipant${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

            const response = await getCurrentUserEvents({
                headers: organizerAuth.headers
            });

            expect(response.statusCode).toBe(200);

            const eventMembership = response.body.events.find(
                (item) => item.event.id === event.id
            );

            expect(eventMembership).toBeDefined();
            expect(eventMembership.event).toHaveProperty("participantCount");
            expect(Number(eventMembership.event.participantCount)).toBe(1);
            expect(eventMembership.event).toHaveProperty("status");
        });

        it("includes event image in current user events", async () => {
            const organizerAuth = await createOrganizer({
                name: "Image Creator",
                email: `imagemetadata${Date.now()}@test.com`
            });

            const createResponse = await createEventWithImage(organizerAuth.headers, {
                title: "Image Metadata Event",
                description: "Image metadata test"
            }, {
                buffer: Buffer.from("event image"),
                filename: "metadata.png",
                contentType: "image/png"
            });

            const eventId = createResponse.body.event.id;

            const response = await getCurrentUserEvents({
                headers: organizerAuth.headers
            });

            expect(response.statusCode).toBe(200);

            const eventMembership = response.body.events.find(
                (item) => item.event.id === eventId
            );

            expect(eventMembership).toBeDefined();
            expect(eventMembership.event.image).toMatch(/^\/uploads\/events\/event-/);
        });

        it("includes like count and current user like state in current user events", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                event: {
                    title: "Current User Like Stats Event"
                }
            });

            const likerAuth = await registerAndAuthenticateUser({
                name: "Liker",
                email: `liker${Date.now()}@test.com`
            });

            await EventLike.create({
                eventId: event.id,
                userId: organizerAuth.user.userId
            });

            await EventLike.create({
                eventId: event.id,
                userId: likerAuth.user.userId
            });

            const response = await getCurrentUserEvents({
                headers: organizerAuth.headers
            });

            expect(response.statusCode).toBe(200);

            const eventMembership = response.body.events.find(
                (item) => item.event.id === event.id
            );

            expect(eventMembership).toBeDefined();

            expect(Number(eventMembership.event.likesCount)).toBe(2);
            expect(eventMembership.event.isLikedByCurrentUser).toBe(true);
        });
    });

    /* =============================
       PAGINATION AND FILTERS
    ============================= */

    describe("Pagination and filters", () => {
        it("paginates current user events by view", async () => {
            const eventCreatorAuth = await createOrganizer({
                name: "Paginated Creator",
                email: `paginatedcreator${Date.now()}@test.com`
            });

            await createEventAsAuthenticatedUser(eventCreatorAuth.headers, {
                title: "Created Event A"
            });

            await createEventAsAuthenticatedUser(eventCreatorAuth.headers, {
                title: "Created Event B"
            });

            await createEventAsAuthenticatedUser(eventCreatorAuth.headers, {
                title: "Created Event C"
            });

            const response = await getCurrentUserEvents({
                headers: eventCreatorAuth.headers,
                query: {
                    view: "created",
                    page: 1,
                    pageSize: 2
                }
            });

            expect(response.statusCode).toBe(200);

            expect(Array.isArray(response.body.events)).toBe(true);
            expect(response.body.events.length).toBe(2);

            expect(response.body.totalEvents).toBe(3);
            expect(response.body.totalPages).toBe(2);
        });

        it("filters current user events by created view", async () => {
            const eventCreatorAuth = await createOrganizer({
                name: "Created View User",
                email: `createdview${Date.now()}@test.com`
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "Participant",
                email: `participant${Date.now()}@test.com`
            });

            await createEventAsAuthenticatedUser(eventCreatorAuth.headers, {
                title: "Created Event"
            });

            const joinedEventResponse = await createEventAsAuthenticatedUser(participantAuth.headers, {
                title: "Joined Event"
            });

            await joinEventAsAuthenticatedUser(joinedEventResponse.body.event.id, eventCreatorAuth.headers);

            const response = await getCurrentUserEvents({
                headers: eventCreatorAuth.headers,
                query: {
                    view: "created"
                }
            });

            expect(response.statusCode).toBe(200);

            expect(response.body.events.every(
                (item) => item.event.creatorId === eventCreatorAuth.user.userId
            )).toBe(true);
        });

        it("filters current user events by joined view", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "Joined Event"
                }
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "Joined View User",
                email: `joinedview${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

            const response = await getCurrentUserEvents({
                headers: participantAuth.headers,
                query: {
                    view: "joined"
                }
            });

            expect(response.statusCode).toBe(200);

            expect(response.body.events.every(
                (item) => item.role !== EVENT_ROLES.ORGANIZER
            )).toBe(true);
        });

        it("filters current user events by created history view", async () => {
            const eventCreatorAuth = await createOrganizer({
                name: "History Creator",
                email: `historycreator${Date.now()}@test.com`
            });

            await createEventAsAuthenticatedUser(eventCreatorAuth.headers, {
                title: "Active Created Event",
                startDateTime: "2026-12-31T10:00:00.000Z",
                endDateTime: "2026-12-31T12:00:00.000Z"
            });

            await createEventAsAuthenticatedUser(eventCreatorAuth.headers, {
                title: "Past Created Event",
                startDateTime: "2020-01-01T10:00:00.000Z",
                endDateTime: "2020-01-01T12:00:00.000Z"
            });

            const response = await getCurrentUserEvents({
                headers: eventCreatorAuth.headers,
                query: {
                    view: "createdHistory"
                }
            });

            expect(response.statusCode).toBe(200);
            expect(response.body.events.length).toBe(1);
            expect(response.body.events[0].event.title).toBe("Past Created Event");
            expect(response.body.events[0].event.status).toBe(EVENT_STATUS.PAST);
        });

        it("filters current user events by joined history view", async () => {
            const { event: pastEvent } = await createPastOrganizerAndEvent({
                event: {
                    title: "Past Joined Event"
                }
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "History Participant",
                email: `historyparticipant${Date.now()}@test.com`
            });

            await EventUserRole.create({
                eventId: pastEvent.id,
                userId: participantAuth.user.userId,
                role: EVENT_ROLES.PARTICIPANT
            });

            const response = await getCurrentUserEvents({
                headers: participantAuth.headers,
                query: {
                    view: "joinedHistory"
                }
            });

            expect(response.statusCode).toBe(200);
            expect(response.body.events.length).toBe(1);
            expect(response.body.events[0].event.title).toBe("Past Joined Event");
            expect(response.body.events[0].event.status).toBe(EVENT_STATUS.PAST);
        });

        it("excludes inactive memberships from current user events", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "Inactive Membership Event"
                }
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "Inactive Membership User",
                email: `inactivemembership${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);
            await leaveEventAsAuthenticatedUser(event.id, participantAuth.headers);

            const response = await getCurrentUserEvents({
                headers: participantAuth.headers
            });

            expect(response.statusCode).toBe(200);

            const eventIds = response.body.events.map((item) => item.event.id);

            expect(eventIds).not.toContain(event.id);
        });
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    describe("Validation errors", () => {
        it("rejects invalid view", async () => {
            const userAuth = await registerAndAuthenticateUser({
                name: "Validation User",
                email: `validation${Date.now()}@test.com`
            });

            const response = await getCurrentUserEvents({
                headers: userAuth.headers,
                query: {
                    view: "invalid-view"
                }
            });

            expect(response.statusCode).toBe(400);
        });

        it("rejects invalid page", async () => {
            const userAuth = await registerAndAuthenticateUser({
                name: "Validation User",
                email: `page${Date.now()}@test.com`
            });

            const response = await getCurrentUserEvents({
                headers: userAuth.headers,
                query: {
                    page: 0
                }
            });

            expect(response.statusCode).toBe(400);
        });

        it("rejects invalid pageSize", async () => {
            const userAuth = await registerAndAuthenticateUser({
                name: "Validation User",
                email: `pagesize${Date.now()}@test.com`
            });

            const response = await getCurrentUserEvents({
                headers: userAuth.headers,
                query: {
                    pageSize: 500
                }
            });

            expect(response.statusCode).toBe(400);
        });

        it("rejects invalid sortBy", async () => {
            const userAuth = await registerAndAuthenticateUser({
                name: "Validation User",
                email: `sortby${Date.now()}@test.com`
            });

            const response = await getCurrentUserEvents({
                headers: userAuth.headers,
                query: {
                    sortBy: "invalid"
                }
            });

            expect(response.statusCode).toBe(400);
        });
    });
});
