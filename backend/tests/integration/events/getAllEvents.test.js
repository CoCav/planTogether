const { EventReview, EventLike } = require("../../../src/models");

const { EVENT_STATUS } = require("../../../src/constants/eventStatus");
const { EVENT_MODES } = require("../../../src/constants/eventModes");

const {
    initializeTestDatabase,
    resetTestDatabase,
    closeTestDatabase
} = require("../../helpers/database/dbTestHelper");

const { registerAndAuthenticateUser } = require("../../helpers/http/authTestHelper");
const {
    getEvents,
    createOrganizer,
    createOrganizerAndEvent,
    createEventAsAuthenticatedUser
} = require("../../helpers/http/eventTestHelper");

const {
    joinEventAsAuthenticatedUser,
    leaveEventAsAuthenticatedUser
} = require("../../helpers/http/eventMembershipTestHelper");

/* ==========================================================================
   Events Integration Tests - Get All Events

   Tests public event listing behavior.

   Responsibilities
   - Test public event retrieval
   - Test event metadata enrichment
   - Test like metadata enrichment
   - Test event filtering
   - Test pagination and sorting
   - Test validation errors

   Notes
   - Public event listings include computed metadata.
   - Participant counts only include active memberships.
   - Review and like stats are enriched in event listings.
=========================================================================== */

describe("Get All Events API", () => {
    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* =============================
       EVENTS RETRIEVAL SUCCESS
    ============================= */

    describe("Events retrieval success", () => {
        it("retrieves all public events", async () => {
            await createOrganizerAndEvent({
                organizer: {
                    name: "Event Creator",
                    email: `creator${Date.now()}@test.com`
                },
                event: {
                    title: "Public Event"
                }
            });

            const response = await getEvents();

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "Events retrieved successfully");
            expect(Array.isArray(response.body.events)).toBe(true);
            expect(response.body.events.length).toBeGreaterThan(0);
        });
    });

    /* =============================
       EVENT METADATA
    ============================= */

    describe("Event metadata", () => {
        it("includes participant count in events", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "Participant Count Event"
                }
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "Participant Count User",
                email: `participantcountuser${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);

            const response = await getEvents();

            expect(response.statusCode).toBe(200);

            const foundEvent = response.body.events.find(
                (item) => item.title === "Participant Count Event"
            );

            expect(foundEvent).toBeDefined();
            expect(foundEvent).toHaveProperty("participantCount");
            expect(Number(foundEvent.participantCount)).toBe(1);
        });

        it("excludes inactive memberships from participant count", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "Inactive Count Event"
                }
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "Inactive Participant",
                email: `inactiveparticipant${Date.now()}@test.com`
            });

            await joinEventAsAuthenticatedUser(event.id, participantAuth.headers);
            await leaveEventAsAuthenticatedUser(event.id, participantAuth.headers);

            const response = await getEvents();

            const foundEvent = response.body.events.find(
                (item) => item.title === "Inactive Count Event"
            );

            expect(foundEvent).toBeDefined();
            expect(foundEvent).toHaveProperty("participantCount");
            expect(Number(foundEvent.participantCount)).toBe(0);
        });

        it("includes event status in events", async () => {
            await createOrganizerAndEvent({
                event: {
                    title: "Past Event",
                    startDateTime: "2020-01-01T10:00:00.000Z",
                    endDateTime: "2020-01-01T12:00:00.000Z"
                }
            });

            const response = await getEvents();

            expect(response.statusCode).toBe(200);

            const event = response.body.events.find(
                (item) => item.title === "Past Event"
            );

            expect(event).toBeDefined();
            expect(event.status).toBe(EVENT_STATUS.PAST);
        });

        it("includes review count and average rating in events", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "Listing Review Stats Event",
                    startDateTime: "2020-01-01T10:00:00.000Z",
                    endDateTime: "2020-01-01T12:00:00.000Z"
                }
            });

            const reviewerAuthA = await registerAndAuthenticateUser({
                name: "Listing Reviewer A",
                email: `listingreviewera${Date.now()}@test.com`
            });

            const reviewerAuthB = await registerAndAuthenticateUser({
                name: "Listing Reviewer B",
                email: `listingreviewerb${Date.now()}@test.com`
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

            const response = await getEvents();

            expect(response.statusCode).toBe(200);

            const foundEvent = response.body.events.find(
                (item) => item.title === "Listing Review Stats Event"
            );

            expect(foundEvent).toBeDefined();
            expect(foundEvent).toHaveProperty("reviewCount");
            expect(foundEvent).toHaveProperty("averageRating");

            expect(Number(foundEvent.reviewCount)).toBe(2);
            expect(Number(foundEvent.averageRating)).toBe(4.5);
        });

        it("includes empty review stats for events without reviews", async () => {
            await createOrganizerAndEvent({
                event: {
                    title: "Listing No Review Stats Event"
                }
            });

            const response = await getEvents();

            expect(response.statusCode).toBe(200);

            const foundEvent = response.body.events.find(
                (item) => item.title === "Listing No Review Stats Event"
            );

            expect(foundEvent).toBeDefined();
            expect(Number(foundEvent.reviewCount)).toBe(0);
            expect(foundEvent.averageRating).toBeNull();
        });
    });

    /* =============================
       LIKE METADATA
    ============================= */

    describe("Like metadata", () => {
        it("includes like count in events", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "Listing Like Stats Event"
                }
            });

            const likerAuthA = await registerAndAuthenticateUser({
                name: "Listing Liker A",
                email: `listinglikera${Date.now()}@test.com`
            });

            const likerAuthB = await registerAndAuthenticateUser({
                name: "Listing Liker B",
                email: `listinglikerb${Date.now()}@test.com`
            });

            await EventLike.create({
                eventId: event.id,
                userId: likerAuthA.user.userId
            });

            await EventLike.create({
                eventId: event.id,
                userId: likerAuthB.user.userId
            });

            const response = await getEvents();

            const foundEvent = response.body.events.find(
                (item) => item.title === "Listing Like Stats Event"
            );

            expect(foundEvent).toBeDefined();
            expect(foundEvent).toHaveProperty("likesCount");
            expect(Number(foundEvent.likesCount)).toBe(2);
        });

        it("includes false current user like state for anonymous event listings", async () => {
            await createOrganizerAndEvent({
                event: {
                    title: "Anonymous Like State Event"
                }
            });

            const response = await getEvents();

            const foundEvent = response.body.events.find(
                (item) => item.title === "Anonymous Like State Event"
            );

            expect(foundEvent).toBeDefined();
            expect(foundEvent.isLikedByCurrentUser).toBe(false);
        });

        it("includes current user like state for authenticated event listings", async () => {
            const { event } = await createOrganizerAndEvent({
                event: {
                    title: "Liked Listing Event"
                }
            });

            const likerAuth = await registerAndAuthenticateUser({
                name: "Listing Current Liker",
                email: `listingcurrentliker${Date.now()}@test.com`
            });

            await EventLike.create({
                eventId: event.id,
                userId: likerAuth.user.userId
            });

            const response = await getEvents({
                headers: likerAuth.headers
            });

            const foundEvent = response.body.events.find(
                (item) => item.title === "Liked Listing Event"
            );

            expect(foundEvent).toBeDefined();
            expect(foundEvent.isLikedByCurrentUser).toBe(true);
        });
    });

    /* =============================
       EVENT FILTERS
    ============================= */

    describe("Event filters", () => {
        it("filters events by mode", async () => {
            await createOrganizerAndEvent({
                event: {
                    title: "Online Event",
                    mode: EVENT_MODES.ONLINE
                }
            });

            await createOrganizerAndEvent({
                event: {
                    title: "In Person Event",
                    mode: EVENT_MODES.IN_PERSON
                }
            });

            const response = await getEvents({
                query: {
                    mode: EVENT_MODES.ONLINE
                }
            });

            expect(response.statusCode).toBe(200);

            expect(response.body.events.every(
                (event) => event.mode === EVENT_MODES.ONLINE
            )).toBe(true);
        });

        it("filters events by status", async () => {
            await createOrganizerAndEvent({
                event: {
                    title: "Past Event",
                    startDateTime: "2020-01-01T10:00:00.000Z",
                    endDateTime: "2020-01-01T12:00:00.000Z"
                }
            });

            await createOrganizerAndEvent({
                event: {
                    title: "Upcoming Event"
                }
            });

            const response = await getEvents({
                query: {
                    status: EVENT_STATUS.PAST
                }
            });

            expect(response.statusCode).toBe(200);

            expect(response.body.events.every(
                (event) => event.status === EVENT_STATUS.PAST
            )).toBe(true);
        });

        it("filters events by search query", async () => {
            await createOrganizerAndEvent({
                event: {
                    title: "React Conference"
                }
            });

            await createOrganizerAndEvent({
                event: {
                    title: "Photography Meetup"
                }
            });

            const response = await getEvents({
                query: {
                    search: "React"
                }
            });

            expect(response.statusCode).toBe(200);

            expect(response.body.events.some(
                (event) => event.title === "React Conference"
            )).toBe(true);
        });
    });

    /* =============================
       PAGINATION & SORTING
    ============================= */

    describe("Pagination and sorting", () => {
        it("supports pagination", async () => {
            const organizerAuth = await createOrganizer({
                name: "Pagination Organizer",
                email: `pagination${Date.now()}@test.com`
            });

            await createEventAsAuthenticatedUser(
                organizerAuth.headers,
                {
                    title: "First Event"
                }
            );

            await createEventAsAuthenticatedUser(
                organizerAuth.headers,
                {
                    title: "Second Event"
                }
            );

            const response = await getEvents({
                query: {
                    page: 1,
                    pageSize: 1
                }
            });

            expect(response.statusCode).toBe(200);
            expect(response.body.events.length).toBe(1);

            expect(response.body).toMatchObject({
                page: 1,
                pageSize: 1
            });

            expect(response.body.totalEvents).toBeGreaterThanOrEqual(2);
            expect(response.body.totalPages).toBeGreaterThanOrEqual(2);
        });

        it("supports sorting", async () => {
            const organizerAuth = await createOrganizer({
                name: "Sorting Organizer",
                email: `sorting${Date.now()}@test.com`
            });

            await createEventAsAuthenticatedUser(
                organizerAuth.headers,
                {
                    title: "B Event"
                }
            );

            await createEventAsAuthenticatedUser(
                organizerAuth.headers,
                {
                    title: "A Event"
                }
            );

            const response = await getEvents({
                query: {
                    sortField: "title",
                    sortOrder: "ASC"
                }
            });

            expect(response.statusCode).toBe(200);

            expect(response.body.events[0].title).toBe("A Event");
        });
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    describe("Validation errors", () => {
        it("rejects invalid status filter", async () => {
            const response = await getEvents({
                query: {
                    status: "invalid"
                }
            });

            expect(response.statusCode).toBe(400);
        });

        it("rejects invalid mode filter", async () => {
            const response = await getEvents({
                query: {
                    mode: "invalid"
                }
            });

            expect(response.statusCode).toBe(400);
        });

        it("rejects invalid pagination values", async () => {
            const response = await getEvents({
                query: {
                    page: -1,
                    pageSize: 0
                }
            });

            expect(response.statusCode).toBe(400);
        });
    });
});
