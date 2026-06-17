/* ==================================================
   EVENT REVIEWS INTEGRATION - GET REVIEWS TESTS

   Tests:
   - public event review retrieval
   - empty review list retrieval
   - nonexistent event handling
   - invalid event ID validation
   - review rating retrieval
   - review user data enrichment
   - review ordering

   Ensures:
   - event reviews can be retrieved publicly
   - reviews include ratings and public user data
   - reviews are ordered from newest to oldest
   - invalid event review requests are rejected correctly
================================================== */

const request = require("supertest");
const app = require("../../../src/app");

const { EventReview, EventUserRole } = require("../../../src/models");

const { EVENT_ROLES } = require("../../../src/constants/eventRoles");

const { initDB, resetDB, closeDB } = require("../../helpers/database/dbTestHelper");

const { registerAndGetToken } = require("../../helpers/api/authHelper");
const { createEventWithOrganizer } = require("../../helpers/api/eventHelper");

describe("Get Event Reviews API", () => {

    beforeAll(initDB);
    afterEach(resetDB);
    afterAll(closeDB);

    /* =============================
       TEST HELPERS
    ============================= */

    const createPastEventWithParticipant = async ({
        participantName = "Review Participant",
        participantEmail = `reviewparticipant${Date.now()}@test.com`
    } = {}) => {
        const { event } = await createEventWithOrganizer({
            organizer: {
                name: "Review Organizer",
                email: `revieworganizer${Date.now()}@test.com`
            },
            event: {
                title: "Past Review Event",
                startDateTime: "2020-01-01T10:00:00.000Z",
                endDateTime: "2020-01-01T12:00:00.000Z"
            }
        });

        const participantAuth = await registerAndGetToken({
            name: participantName,
            email: participantEmail
        });

        await EventUserRole.create({
            eventId: event.id,
            userId: participantAuth.user.userId,
            role: EVENT_ROLES.PARTICIPANT
        });

        return {
            event,
            participantAuth
        };
    };

    const createReviewForEvent = async ({ event, participantAuth, rating = 5, comment }) => {
        return EventReview.create({
            eventId: event.id,
            userId: participantAuth.user.userId,
            rating,
            comment
        });
    };

    /* =============================
       REVIEW RETRIEVAL SUCCESS
    ============================= */

    it("should retrieve reviews for an event", async () => {
        const { event, participantAuth } = await createPastEventWithParticipant();

        await createReviewForEvent({
            event,
            participantAuth,
            rating: 5,
            comment: "Great event!"
        });

        const res = await request(app).get(`/api/events/${event.id}/reviews`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Event reviews retrieved successfully");
        expect(Array.isArray(res.body.reviews)).toBe(true);
        expect(res.body.reviews.length).toBe(1);

        expect(res.body.reviews[0]).toMatchObject({
            eventId: event.id,
            userId: participantAuth.user.userId,
            comment: "Great event!"
        });
    });

    it("should return an empty review list when event has no reviews", async () => {
        const { event } = await createEventWithOrganizer({
            organizer: {
                name: "Empty Reviews Organizer",
                email: `emptyreviews${Date.now()}@test.com`
            },
            event: {
                title: "Empty Reviews Event"
            }
        });

        const res = await request(app).get(`/api/events/${event.id}/reviews`);

        expect(res.statusCode).toBe(200);
        expect(res.body.reviews).toEqual([]);
    });

    /* =============================
       REVIEW METADATA
    ============================= */

    it("should include public user data for each review", async () => {
        const { event, participantAuth } = await createPastEventWithParticipant({
            participantName: "Visible Reviewer",
            participantEmail: `visiblereviewer${Date.now()}@test.com`
        });

        await createReviewForEvent({
            event,
            participantAuth,
            comment: "Nice event!"
        });

        const res = await request(app).get(`/api/events/${event.id}/reviews`);

        expect(res.statusCode).toBe(200);

        expect(res.body.reviews[0]).toHaveProperty("user");

        expect(res.body.reviews[0].user).toMatchObject({
            id: participantAuth.user.userId,
            name: "Visible Reviewer"
        });

        expect(res.body.reviews[0].user).not.toHaveProperty("email");
        expect(res.body.reviews[0].user).not.toHaveProperty("password");
    });

    it("should order reviews from newest to oldest", async () => {
        const { event, participantAuth } = await createPastEventWithParticipant({
            participantName: "First Reviewer",
            participantEmail: `firstreviewer${Date.now()}@test.com`
        });

        const secondParticipantAuth = await registerAndGetToken({
            name: "Second Reviewer",
            email: `secondreviewer${Date.now()}@test.com`
        });

        await EventUserRole.create({
            eventId: event.id,
            userId: secondParticipantAuth.user.userId,
            role: EVENT_ROLES.PARTICIPANT
        });

        await EventReview.create({
            eventId: event.id,
            userId: participantAuth.user.userId,
            rating: 4,
            comment: "Older review",
            createdAt: new Date("2026-01-01T10:00:00.000Z"),
            updatedAt: new Date("2026-01-01T10:00:00.000Z")
        });

        await EventReview.create({
            eventId: event.id,
            userId: secondParticipantAuth.user.userId,
            rating: 5,
            comment: "Newer review",
            createdAt: new Date("2026-01-01T11:00:00.000Z"),
            updatedAt: new Date("2026-01-01T11:00:00.000Z")
        });

        const res = await request(app).get(`/api/events/${event.id}/reviews`);

        expect(res.statusCode).toBe(200);
        expect(res.body.reviews.length).toBe(2);

        expect(res.body.reviews[0].comment).toBe("Newer review");
        expect(res.body.reviews[1].comment).toBe("Older review");
    });

    it("should include review rating", async () => {
        const { event, participantAuth } = await createPastEventWithParticipant();

        await createReviewForEvent({
            event,
            participantAuth,
            rating: 4,
            comment: "Nice event!"
        });

        const res = await request(app).get(`/api/events/${event.id}/reviews`);

        expect(res.statusCode).toBe(200);
        expect(res.body.reviews[0].rating).toBe(4);
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should return 404 for nonexistent event", async () => {
        const res = await request(app).get("/api/events/999999/reviews");

        expect(res.statusCode).toBe(404);
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    it("should reject invalid eventId", async () => {
        const res = await request(app).get("/api/events/abc/reviews");

        expect(res.statusCode).toBe(400);
    });
});
