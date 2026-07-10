const { EventReview, EventLike } = require("../../../src/models");

const { EVENT_STATUS } = require("../../../src/constants/eventStatus");

const {
    initializeTestDatabase,
    resetTestDatabase,
    closeTestDatabase
} = require("../../helpers/database/dbTestHelper");

const { registerAndAuthenticateUser } = require("../../helpers/http/authTestHelper");
const {
    createOrganizerAndEvent,
    getEventById
} = require("../../helpers/http/eventTestHelper");

const {
    joinEventAsAuthenticatedUser,
    leaveEventAsAuthenticatedUser
} = require("../../helpers/http/eventMembershipTestHelper");

/* ==========================================================================
   Events Integration Tests - Get Event

   Tests single event retrieval behavior.

   Responsibilities
   - Test public event retrieval by ID
   - Test event metadata enrichment
   - Test like metadata enrichment
   - Test validation errors
   - Test missing event handling

   Notes
   - Single event responses include computed metadata.
   - Participant counts only include active memberships.
   - Review and like stats are enriched in the event response.
=========================================================================== */

describe("Get Event API", () => {
    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* =============================
       EVENT RETRIEVAL SUCCESS
    ============================= */

    describe("Event retrieval success", () => {
        it("retrieves a single event by ID", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "Single Event"
                }
            });

            const response = await getEventById(event.id);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "Event retrieved successfully");
            expect(response.body).toHaveProperty("event");

            expect(response.body.event).toMatchObject({
                id: event.id,
                title: "Single Event"
            });
        });
    });

    /* =============================
       EVENT METADATA
    ============================= */

    describe("Event metadata", () => {
        it("includes participant count", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "Count Event"
                }
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "Count Participant",
                email: `countparticipant${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

            const response = await getEventById(event.id);

            expect(response.statusCode).toBe(200);
            expect(response.body.event).toHaveProperty("participantCount");
            expect(Number(response.body.event.participantCount)).toBe(1);
        });

        it("excludes inactive memberships from participant count", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "Inactive Count Event"
                }
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "Inactive Count Participant",
                email: `inactivecountparticipant${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);
            await leaveEventAsAuthenticatedUser(event.id, participantAuth.headers);

            const response = await getEventById(event.id);

            expect(response.statusCode).toBe(200);
            expect(response.body.event).toHaveProperty("participantCount");
            expect(Number(response.body.event.participantCount)).toBe(0);
        });

        it("includes creator data", async () => {
            const { organizerAuth, event } = await createOrganizerAndEvent({
                organizer: {
                    name: "Creator Data User",
                    email: `creatordatauser${Date.now()}@test.com`
                },
                event: {
                    title: "Creator Data Event"
                }
            });

            const response = await getEventById(event.id);

            expect(response.statusCode).toBe(200);
            expect(response.body.event).toHaveProperty("creator");

            expect(response.body.event.creator).toMatchObject({
                id: organizerAuth.user.userId,
                name: "Creator Data User"
            });
        });

        it("includes upcoming status for future event", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "Upcoming Event",
                    startDateTime: "2030-01-01T10:00:00.000Z",
                    endDateTime: "2030-01-01T12:00:00.000Z"
                }
            });

            const response = await getEventById(event.id);

            expect(response.statusCode).toBe(200);
            expect(response.body.event.status).toBe(EVENT_STATUS.UPCOMING);
        });

        it("includes past status for past event", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "Past Event",
                    startDateTime: "2020-01-01T10:00:00.000Z",
                    endDateTime: "2020-01-01T12:00:00.000Z"
                }
            });

            const response = await getEventById(event.id);

            expect(response.statusCode).toBe(200);
            expect(response.body.event.status).toBe(EVENT_STATUS.PAST);
        });

        it("includes review count and average rating", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "Review Stats Event",
                    startDateTime: "2020-01-01T10:00:00.000Z",
                    endDateTime: "2020-01-01T12:00:00.000Z"
                }
            });

            const reviewerAuthA = await registerAndAuthenticateUser({
                name: "Reviewer A",
                email: `reviewera${Date.now()}@test.com`
            });

            const reviewerAuthB = await registerAndAuthenticateUser({
                name: "Reviewer B",
                email: `reviewerb${Date.now()}@test.com`
            });

            await EventReview.create({
                eventId: event.id,
                userId: reviewerAuthA.user.userId,
                rating: 5,
                comment: "Great event!"
            });

            await EventReview.create({
                eventId: event.id,
                userId: reviewerAuthB.user.userId,
                rating: 4,
                comment: "Nice event!"
            });

            const response = await getEventById(event.id);

            expect(response.statusCode).toBe(200);
            expect(response.body.event).toHaveProperty("reviewCount");
            expect(response.body.event).toHaveProperty("averageRating");

            expect(Number(response.body.event.reviewCount)).toBe(2);
            expect(Number(response.body.event.averageRating)).toBe(4.5);
        });

        it("returns empty review stats when event has no reviews", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "No Review Stats Event"
                }
            });

            const response = await getEventById(event.id);

            expect(response.statusCode).toBe(200);
            expect(Number(response.body.event.reviewCount)).toBe(0);
            expect(response.body.event.averageRating).toBeNull();
        });
    });

    /* =============================
       LIKE METADATA
    ============================= */

    describe("Like metadata", () => {
        it("includes like count", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "Like Stats Event"
                }
            });

            const likerAuthA = await registerAndAuthenticateUser({
                name: "Liker A",
                email: `likera${Date.now()}@test.com`
            });

            const likerAuthB = await registerAndAuthenticateUser({
                name: "Liker B",
                email: `likerb${Date.now()}@test.com`
            });

            await EventLike.create({
                eventId: event.id,
                userId: likerAuthA.user.userId
            });

            await EventLike.create({
                eventId: event.id,
                userId: likerAuthB.user.userId
            });

            const response = await getEventById(event.id);

            expect(response.statusCode).toBe(200);
            expect(response.body.event).toHaveProperty("likesCount");
            expect(Number(response.body.event.likesCount)).toBe(2);
        });

        it("includes false current user like state for anonymous requests", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "Anonymous Like Event"
                }
            });

            const response = await getEventById(event.id);

            expect(response.statusCode).toBe(200);
            expect(response.body.event.isLikedByCurrentUser).toBe(false);
        });

        it("includes current user like state for authenticated requests", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "Liked Event"
                }
            });

            const likerAuth = await registerAndAuthenticateUser({
                name: "Current Liker",
                email: `currentliker${Date.now()}@test.com`
            });

            await EventLike.create({
                eventId: event.id,
                userId: likerAuth.user.userId
            });

            const response = await getEventById(event.id, likerAuth.headers);

            expect(response.statusCode).toBe(200);
            expect(response.body.event.isLikedByCurrentUser).toBe(true);
        });
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    describe("Validation errors", () => {
        it("rejects invalid event identifiers", async () => {
            const response = await getEventById("abc");

            expect(response.statusCode).toBe(400);
        });
    });

    /* =============================
       NOT FOUND
    ============================= */

    describe("Not found", () => {
        it("returns 404 when the event does not exist", async () => {
            const response = await getEventById(999999);

            expect(response.statusCode).toBe(404);
        });
    });
});
