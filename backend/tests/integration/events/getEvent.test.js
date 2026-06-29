/* ==============================================
   EVENTS INTEGRATION - GET EVENT TESTS

   Tests:
   - public event retrieval by ID
   - nonexistent event handling
   - invalid event ID validation
   - active participant count enrichment
   - inactive membership exclusion from participant count
   - event status enrichment
   - creator data enrichment
   - review count enrichment
   - average rating enrichment
   - like stats are enriched in the event response
   - current user like state is enriched in the event response

   Ensures:
   - a single event can be retrieved publicly by ID
   - invalid event requests are rejected correctly
   - event metadata is enriched in the response
   - participant counts only include active memberships
   - review stats are enriched in the response
   - like stats are enriched in the event response
   - current user like state is enriched in the event response
   - shared event status constants are used for expected statuses
=============================================== */

const request = require("supertest");
const app = require("../../../src/app");

const { EventReview, EventLike } = require("../../../src/models");

const { EVENT_STATUS } = require("../../../src/constants/eventStatus");

const { initDB, resetDB, closeDB } = require("../../helpers/database/dbTestHelper");

const { registerAndGetToken } = require("../../helpers/api/authHelper");
const { createEventWithOrganizer } = require("../../helpers/api/eventHelper");
const { joinEvent } = require("../../helpers/api/eventMembershipHelper");

describe("Get Event API", () => {

    beforeAll(initDB);
    afterEach(resetDB);
    afterAll(closeDB);

    /* =============================
       EVENT RETRIEVAL SUCCESS
    ============================= */

    it("should retrieve a single event by ID", async () => {
        const { event } = await createEventWithOrganizer({
            organizer: {
                name: "Single Event User",
                email: `single${Date.now()}@test.com`
            },
            event: {
                title: "Single Event"
            }
        });

        const res = await request(app).get(`/api/events/${event.id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Event retrieved successfully");
        expect(res.body).toHaveProperty("event");

        expect(res.body.event).toMatchObject({
            id: event.id,
            title: "Single Event"
        });
    });

    /* =============================
       EVENT METADATA
    ============================= */

    it("should include participant count", async () => {
        const { event } = await createEventWithOrganizer({
            organizer: {
                name: "Count Creator",
                email: `countcreator${Date.now()}@test.com`
            },
            event: {
                title: "Count Event"
            }
        });

        const participantAuth = await registerAndGetToken({
            name: "Participant",
            email: `participant${Date.now()}@test.com`
        });

        await joinEvent(event.id, participantAuth.headers);

        const res = await request(app).get(`/api/events/${event.id}`);

        expect(res.statusCode).toBe(200);

        expect(res.body.event).toHaveProperty("participantCount");
        expect(Number(res.body.event.participantCount)).toBe(1);
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

        const res = await request(app).get(`/api/events/${event.id}`);

        expect(res.statusCode).toBe(200);

        expect(res.body.event).toHaveProperty("participantCount");
        expect(Number(res.body.event.participantCount)).toBe(0);
    });

    it("should include creator data", async () => {
        const { organizerAuth, event } = await createEventWithOrganizer({
            organizer: {
                name: "Creator Data User",
                email: `creatordata${Date.now()}@test.com`
            },
            event: {
                title: "Creator Data Event"
            }
        });

        const res = await request(app).get(`/api/events/${event.id}`);

        expect(res.statusCode).toBe(200);

        expect(res.body.event).toHaveProperty("creator");

        expect(res.body.event.creator).toMatchObject({
            id: organizerAuth.user.userId,
            name: "Creator Data User"
        });
    });

    it("should include upcoming status for future event", async () => {
        const { event } = await createEventWithOrganizer({
            organizer: {
                name: "Upcoming User",
                email: `upcoming${Date.now()}@test.com`
            },
            event: {
                title: "Upcoming Event",
                startDateTime: "2030-01-01T10:00:00.000Z",
                endDateTime: "2030-01-01T12:00:00.000Z"
            }
        });

        const res = await request(app).get(`/api/events/${event.id}`);

        expect(res.statusCode).toBe(200);

        expect(res.body.event.status).toBe(EVENT_STATUS.UPCOMING);
    });

    it("should include past status for past event", async () => {
        const { event } = await createEventWithOrganizer({
            organizer: {
                name: "Past User",
                email: `past${Date.now()}@test.com`
            },
            event: {
                title: "Past Event",
                startDateTime: "2020-01-01T10:00:00.000Z",
                endDateTime: "2020-01-01T12:00:00.000Z"
            }
        });

        const res = await request(app).get(`/api/events/${event.id}`);

        expect(res.statusCode).toBe(200);

        expect(res.body.event.status).toBe(EVENT_STATUS.PAST);
    });

    it("should include review count and average rating", async () => {
        const { event } = await createEventWithOrganizer({
            organizer: {
                name: "Review Stats Creator",
                email: `reviewstatscreator${Date.now()}@test.com`
            },
            event: {
                title: "Review Stats Event",
                startDateTime: "2020-01-01T10:00:00.000Z",
                endDateTime: "2020-01-01T12:00:00.000Z"
            }
        });

        const reviewerAuthA = await registerAndGetToken({
            name: "Reviewer A",
            email: `reviewera${Date.now()}@test.com`
        });

        const reviewerAuthB = await registerAndGetToken({
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

        const res = await request(app).get(`/api/events/${event.id}`);

        expect(res.statusCode).toBe(200);

        expect(res.body.event).toHaveProperty("reviewCount");
        expect(res.body.event).toHaveProperty("averageRating");

        expect(Number(res.body.event.reviewCount)).toBe(2);
        expect(Number(res.body.event.averageRating)).toBe(4.5);
    });

    it("should return empty review stats when event has no reviews", async () => {
        const { event } = await createEventWithOrganizer({
            organizer: {
                name: "No Review Stats Creator",
                email: `noreviewstats${Date.now()}@test.com`
            },
            event: {
                title: "No Review Stats Event"
            }
        });

        const res = await request(app).get(`/api/events/${event.id}`);

        expect(res.statusCode).toBe(200);

        expect(Number(res.body.event.reviewCount)).toBe(0);
        expect(res.body.event.averageRating).toBeNull();
    });

    it("should include like count", async () => {
        const { event } = await createEventWithOrganizer({
            organizer: {
                name: "Like Stats Creator",
                email: `likestats${Date.now()}@test.com`
            },
            event: {
                title: "Like Stats Event"
            }
        });

        const likerAuthA = await registerAndGetToken({
            name: "Liker A",
            email: `likera${Date.now()}@test.com`
        });

        const likerAuthB = await registerAndGetToken({
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

        const res = await request(app).get(`/api/events/${event.id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.event).toHaveProperty("likesCount");
        expect(Number(res.body.event.likesCount)).toBe(2);
    });

    /* =============================
       LIKE METADATA
    ============================= */

    it("should include current user like state for anonymous requests", async () => {
        const { event } = await createEventWithOrganizer({
            organizer: {
                name: "Anonymous Like Creator",
                email: `anonymouslikecreator${Date.now()}@test.com`
            },
            event: {
                title: "Anonymous Like Event"
            }
        });

        const res = await request(app).get(`/api/events/${event.id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.event.isLikedByCurrentUser).toBe(false);
    });

    it("should include current user like state for authenticated requests", async () => {
        const { event } = await createEventWithOrganizer({
            organizer: {
                name: "Liked Event Creator",
                email: `likedeventcreator${Date.now()}@test.com`
            },
            event: {
                title: "Liked Event"
            }
        });

        const likerAuth = await registerAndGetToken({
            name: "Current Liker",
            email: `currentliker${Date.now()}@test.com`
        });

        await EventLike.create({
            eventId: event.id,
            userId: likerAuth.user.userId
        });

        const res = await request(app)
            .get(`/api/events/${event.id}`)
            .set(likerAuth.headers);

        expect(res.statusCode).toBe(200);
        expect(res.body.event.isLikedByCurrentUser).toBe(true);
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should return 404 for nonexistent event", async () => {
        const res = await request(app).get("/api/events/999999");

        expect(res.statusCode).toBe(404);
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    it("should reject invalid eventId", async () => {
        const res = await request(app).get("/api/events/abc");

        expect(res.statusCode).toBe(400);
    });
});
