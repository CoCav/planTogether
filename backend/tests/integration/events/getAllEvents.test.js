/* ==================================================
   EVENTS INTEGRATION - GET ALL EVENTS TESTS

   Tests:
   - public events retrieval
   - active participant count enrichment
   - inactive membership exclusion from participant count
   - event status enrichment
   - filtering by (type, theme, mode, location, creatorId, creator name, search, status)
   - pagination
   - sorting
   - invalid query validation
   - review count enrichment
   - average rating enrichment
   - like count enrichment
   - current user like state enrichment

   Ensures:
   - public event listing works correctly
   - filters and pagination behave correctly
   - event metadata is enriched in responses
   - validators protect query params
   - participant counts only include active memberships
   - review stats are enriched in event listings
   - like stats are enriched in event listings
   - current user like state is enriched in event listings
   - shared event status constants are used for expected statuses
================================================== */

const request = require("supertest");
const app = require("../../../src/app");

const { EventReview, EventLike } = require("../../../src/models");

const { EVENT_STATUS } = require("../../../src/constants/eventStatus");
const { EVENT_MODES } = require("../../../src/constants/eventModes");

const { initDB, resetDB, closeDB } = require("../../helpers/database/dbTestHelper");

const { registerAndGetToken } = require("../../helpers/api/authHelper");
const { createAuthenticatedEvent, createEventWithOrganizer } = require("../../helpers/api/eventHelper");
const { joinEvent } = require("../../helpers/api/eventMembershipHelper");

describe("Get All Events API", () => {

    beforeAll(initDB);
    afterEach(resetDB);
    afterAll(closeDB);

    /* =============================
       EVENTS RETRIEVAL SUCCESS
    ============================= */

    it("should retrieve all public events", async () => {
        await createEventWithOrganizer({
            organizer: {
                name: "Event Creator",
                email: `creator${Date.now()}@test.com`
            },
            event: {
                title: "Public Event"
            }
        });

        const res = await request(app).get("/api/events");

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Events retrieved successfully");

        expect(Array.isArray(res.body.events)).toBe(true);

        expect(res.body.events.length).toBeGreaterThan(0);
    });

    /* =============================
       EVENT METADATA
    ============================= */

    it("should include participant count in events", async () => {
        const { event } = await createEventWithOrganizer({
            organizer: {
                name: "Participant Count Creator",
                email: `participantcount${Date.now()}@test.com`
            },
            event: {
                title: "Participant Count Event"
            }
        });

        const participantAuth = await registerAndGetToken({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        await joinEvent(event.id, participantAuth.headers);

        const res = await request(app).get("/api/events");

        expect(res.statusCode).toBe(200);

        const foundEvent = res.body.events.find((item) => item.title === "Participant Count Event");

        expect(foundEvent).toBeDefined();

        expect(foundEvent).toHaveProperty("participantCount");
        expect(Number(foundEvent.participantCount)).toBe(1);
    });

    it("should exclude inactive memberships from participant count", async () => {
        const { event } = await createEventWithOrganizer({
            organizer: {
                name: "Inactive Count Creator",
                email: `inactivecountcreator${Date.now()}@test.com`
            },
            event: {
                title: "Inactive Count Event"
            }
        });

        const participantAuth = await registerAndGetToken({
            name: "Inactive Participant",
            email: `inactiveparticipant${Date.now()}@test.com`
        });

        await joinEvent(event.id, participantAuth.headers);

        await request(app)
            .delete(`/api/events/${event.id}/members/leave`)
            .set(participantAuth.headers);

        const res = await request(app).get("/api/events");

        const foundEvent = res.body.events.find(
            (item) => item.title === "Inactive Count Event"
        );

        expect(foundEvent).toBeDefined();
        expect(foundEvent).toHaveProperty("participantCount");
        expect(Number(foundEvent.participantCount)).toBe(0);
    });

    it("should include event status in events", async () => {
        await createEventWithOrganizer({
            organizer: {
                name: "Status Creator",
                email: `status${Date.now()}@test.com`
            },
            event: {
                title: "Past Event",
                startDateTime: "2020-01-01T10:00:00.000Z",
                endDateTime: "2020-01-01T12:00:00.000Z"
            }
        });

        const res = await request(app).get("/api/events");

        expect(res.statusCode).toBe(200);

        const event = res.body.events.find((item) => item.title === "Past Event");

        expect(event).toBeDefined();
        expect(event.status).toBe(EVENT_STATUS.PAST);
    });

    it("should include review count and average rating in events", async () => {
        const { event } = await createEventWithOrganizer({
            organizer: {
                name: "Listing Review Stats Creator",
                email: `listingreviewstats${Date.now()}@test.com`
            },
            event: {
                title: "Listing Review Stats Event",
                startDateTime: "2020-01-01T10:00:00.000Z",
                endDateTime: "2020-01-01T12:00:00.000Z"
            }
        });

        const reviewerAuthA = await registerAndGetToken({
            name: "Listing Reviewer A",
            email: `listingreviewera${Date.now()}@test.com`
        });

        const reviewerAuthB = await registerAndGetToken({
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

        const res = await request(app).get("/api/events");

        expect(res.statusCode).toBe(200);

        const foundEvent = res.body.events.find(
            (item) => item.title === "Listing Review Stats Event"
        );

        expect(foundEvent).toBeDefined();

        expect(foundEvent).toHaveProperty("reviewCount");
        expect(foundEvent).toHaveProperty("averageRating");

        expect(Number(foundEvent.reviewCount)).toBe(2);
        expect(Number(foundEvent.averageRating)).toBe(4.5);
    });

    it("should include empty review stats for events without reviews", async () => {
        await createEventWithOrganizer({
            organizer: {
                name: "Listing No Review Stats Creator",
                email: `listingnoreviewstats${Date.now()}@test.com`
            },
            event: {
                title: "Listing No Review Stats Event"
            }
        });

        const res = await request(app).get("/api/events");

        expect(res.statusCode).toBe(200);

        const foundEvent = res.body.events.find(
            (item) => item.title === "Listing No Review Stats Event"
        );

        expect(foundEvent).toBeDefined();

        expect(Number(foundEvent.reviewCount)).toBe(0);
        expect(foundEvent.averageRating).toBeNull();
    });

    /* =============================
       LIKE METADATA
    ============================= */

    it("should include like count in events", async () => {
        const { event } = await createEventWithOrganizer({
            organizer: {
                name: "Listing Like Stats Creator",
                email: `listinglikestats${Date.now()}@test.com`
            },
            event: {
                title: "Listing Like Stats Event"
            }
        });

        const likerAuthA = await registerAndGetToken({
            name: "Listing Liker A",
            email: `listinglikera${Date.now()}@test.com`
        });

        const likerAuthB = await registerAndGetToken({
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

        const res = await request(app).get("/api/events");

        const foundEvent = res.body.events.find(
            (item) => item.title === "Listing Like Stats Event"
        );

        expect(foundEvent).toBeDefined();
        expect(foundEvent).toHaveProperty("likesCount");
        expect(Number(foundEvent.likesCount)).toBe(2);
    });

    it("should include false current user like state for anonymous event listings", async () => {
        await createEventWithOrganizer({
            organizer: {
                name: "Anonymous Like State Creator",
                email: `anonymouslikestate${Date.now()}@test.com`
            },
            event: {
                title: "Anonymous Like State Event"
            }
        });

        const res = await request(app).get("/api/events");

        const foundEvent = res.body.events.find(
            (item) => item.title === "Anonymous Like State Event"
        );

        expect(foundEvent).toBeDefined();
        expect(foundEvent.isLikedByCurrentUser).toBe(false);
    });

    it("should include current user like state for authenticated event listings", async () => {
        const { event } = await createEventWithOrganizer({
            organizer: {
                name: "Liked Listing Creator",
                email: `likedlistingcreator${Date.now()}@test.com`
            },
            event: {
                title: "Liked Listing Event"
            }
        });

        const likerAuth = await registerAndGetToken({
            name: "Listing Current Liker",
            email: `listingcurrentliker${Date.now()}@test.com`
        });

        await EventLike.create({
            eventId: event.id,
            userId: likerAuth.user.userId
        });

        const res = await request(app)
            .get("/api/events")
            .set(likerAuth.headers);

        const foundEvent = res.body.events.find(
            (item) => item.title === "Liked Listing Event"
        );

        expect(foundEvent).toBeDefined();
        expect(foundEvent.isLikedByCurrentUser).toBe(true);
    });

    /* =============================
       EVENT FILTERS
    ============================= */

    it("should filter events by creatorId", async () => {
        const { organizerAuth } = await createEventWithOrganizer({
            organizer: {
                name: "Creator Filter",
                email: `creatorfilter${Date.now()}@test.com`
            },
            event: {
                title: "Creator Event"
            }
        });

        const res = await request(app)
            .get("/api/events")
            .query({ creatorId: organizerAuth.user.userId });

        expect(res.statusCode).toBe(200);

        expect(res.body.events.every((event) => event.creatorId === organizerAuth.user.userId)).toBe(true);
    });

    it("should filter events by creator name", async () => {
        await createEventWithOrganizer({
            organizer: {
                name: "Unique Creator",
                email: `creatorname${Date.now()}@test.com`
            },
            event: {
                title: "Creator Name Event"
            }
        });

        const res = await request(app)
            .get("/api/events")
            .query({ creator: "Unique Creator" });

        expect(res.statusCode).toBe(200);

        expect(res.body.events.every((event) => event.creator.name === "Unique Creator")).toBe(true);
    });

    it("should filter events by search", async () => {
        await createEventWithOrganizer({
            organizer: {
                name: "Search Creator",
                email: `search${Date.now()}@test.com`
            },
            event: {
                title: "JavaScript Meetup"
            }
        });

        const res = await request(app)
            .get("/api/events")
            .query({ search: "JavaScript" });

        expect(res.statusCode).toBe(200);

        expect(res.body.events.some((event) => event.title.includes("JavaScript"))).toBe(true);
    });

    it("should filter events by type", async () => {
        const creatorAuth = await registerAndGetToken({
            name: "Type Creator",
            email: `type${Date.now()}@test.com`
        });

        await createAuthenticatedEvent(creatorAuth.headers, {
            title: "Workshop Event",
            type: "Workshop"
        });

        await createAuthenticatedEvent(creatorAuth.headers, {
            title: "Meetup Event",
            type: "Meetup"
        });

        const res = await request(app)
            .get("/api/events")
            .query({ type: "Workshop" });

        expect(res.statusCode).toBe(200);

        expect(res.body.events.every((event) => event.type === "Workshop")).toBe(true);
    });

    it("should filter events by theme", async () => {
        await createEventWithOrganizer({
            organizer: {
                name: "Theme Creator",
                email: `theme${Date.now()}@test.com`
            },
            event: {
                title: "Gaming Event",
                theme: "Gaming"
            }
        });

        const res = await request(app)
            .get("/api/events")
            .query({ theme: "Gaming" });

        expect(res.statusCode).toBe(200);

        expect(res.body.events.every((event) => event.theme === "Gaming")).toBe(true);
    });

    it("should filter events by mode", async () => {
        await createEventWithOrganizer({
            organizer: {
                name: "Mode Creator",
                email: `mode${Date.now()}@test.com`
            },
            event: {
                title: "Online Event",
                mode: EVENT_MODES.ONLINE
            }
        });

        const res = await request(app)
            .get("/api/events")
            .query({ mode: EVENT_MODES.ONLINE });

        expect(res.statusCode).toBe(200);

        expect(res.body.events.every((event) => event.mode === EVENT_MODES.ONLINE)).toBe(true);
    });

    it("should filter events by location", async () => {
        await createEventWithOrganizer({
            organizer: {
                name: "Location Creator",
                email: `location${Date.now()}@test.com`
            },
            event: {
                title: "Montreal Event",
                location: "Montreal"
            }
        });

        const res = await request(app)
            .get("/api/events")
            .query({ location: "Montreal" });

        expect(res.statusCode).toBe(200);

        expect(res.body.events.every((event) => event.location === "Montreal")).toBe(true);
    });

    it("should filter events by status", async () => {
        const creatorAuth = await registerAndGetToken({
            name: "Status Filter Creator",
            email: `statusfilter${Date.now()}@test.com`
        });

        await createAuthenticatedEvent(creatorAuth.headers,
            {
                title: "Upcoming Event",
                startDateTime: "2030-01-01T10:00:00.000Z",
                endDateTime: "2030-01-01T12:00:00.000Z"
            });

        await createAuthenticatedEvent(creatorAuth.headers, {
            title: "Past Event",
            startDateTime: "2020-01-01T10:00:00.000Z",
            endDateTime: "2020-01-01T12:00:00.000Z"
        });

        const res = await request(app)
            .get("/api/events")
            .query({ status: EVENT_STATUS.UPCOMING });

        expect(res.statusCode).toBe(200);

        expect(res.body.events.every((event) => event.status === EVENT_STATUS.UPCOMING)).toBe(true);
    });

    it("should filter events by exact date", async () => {
        await createEventWithOrganizer({
            organizer: {
                name: "Date Creator",
                email: `date${Date.now()}@test.com`
            },
            event: {
                title: "Christmas Event",
                startDateTime: "2026-12-25T10:00:00.000Z",
                endDateTime: "2026-12-25T12:00:00.000Z"
            }
        });

        const res = await request(app)
            .get("/api/events")
            .query({ date: "2026-12-25" });

        expect(res.statusCode).toBe(200);

        expect(res.body.events.some((event) => event.title === "Christmas Event")).toBe(true);
    });

    it("should filter events by date range", async () => {
        await createEventWithOrganizer({
            organizer: {
                name: "Range Creator",
                email: `range${Date.now()}@test.com`
            },
            event: {
                title: "Range Event",
                startDateTime: "2026-06-15T10:00:00.000Z",
                endDateTime: "2026-06-15T12:00:00.000Z"
            }
        });

        const res = await request(app)
            .get("/api/events")
            .query({
                startDate: "2026-06-01",
                endDate: "2026-06-30"
            });

        expect(res.statusCode).toBe(200);

        expect(res.body.events.some((event) => event.title === "Range Event")).toBe(true);
    });

    /* =============================
       PAGINATION / SORTING
    ============================= */

    it("should paginate events", async () => {
        const creatorAuth = await registerAndGetToken({
            name: "Pagination Creator",
            email: `pagination${Date.now()}@test.com`
        });

        await createAuthenticatedEvent(creatorAuth.headers, { title: "Event A" });
        await createAuthenticatedEvent(creatorAuth.headers, { title: "Event B" });
        await createAuthenticatedEvent(creatorAuth.headers, { title: "Event C" });

        const res = await request(app)
            .get("/api/events")
            .query({
                page: 1,
                pageSize: 2
            });

        expect(res.statusCode).toBe(200);

        expect(res.body.events.length).toBe(2);

        expect(res.body).toHaveProperty("totalEvents");
        expect(res.body).toHaveProperty("totalPages");

        expect(res.body.totalEvents).toBe(3);
        expect(res.body.totalPages).toBe(2);
    });

    it("should sort events by title ascending", async () => {
        const creatorAuth = await registerAndGetToken({
            name: "Sort Creator",
            email: `sort${Date.now()}@test.com`
        });

        await createAuthenticatedEvent(creatorAuth.headers, { title: "Z Event" });
        await createAuthenticatedEvent(creatorAuth.headers, { title: "A Event" });

        const res = await request(app)
            .get("/api/events")
            .query({
                sortBy: "title",
                order: "asc"
            });

        expect(res.statusCode).toBe(200);

        const titles = res.body.events.map((event) => event.title);

        const sortedTitles = [...titles].sort();

        expect(titles).toEqual(sortedTitles);
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    it("should reject invalid mode filter", async () => {
        const res = await request(app)
            .get("/api/events")
            .query({ mode: "physical" });

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid creatorId", async () => {
        const res = await request(app)
            .get("/api/events")
            .query({ creatorId: "abc" });

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid status filter", async () => {
        const res = await request(app)
            .get("/api/events")
            .query({ status: "active" });

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid page", async () => {
        const res = await request(app)
            .get("/api/events")
            .query({ page: 0 });

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid pageSize", async () => {
        const res = await request(app)
            .get("/api/events")
            .query({ pageSize: 500 });

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid order", async () => {
        const res = await request(app)
            .get("/api/events")
            .query({ order: "invalid" });

        expect(res.statusCode).toBe(400);
    });
});
